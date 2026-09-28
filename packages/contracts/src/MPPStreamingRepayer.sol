// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./CredoVault.sol";
import "./CredoCreditManager.sol";
import "./ILiquiditySource.sol";

/**
 * @title MPPStreamingRepayer
  *@author Credence_finance
 * @notice Emulates Tempo's Machine Payments Protocol (MPP) for automated,
 *         streaming invoice repayments.
 *
 * How it works:
 *   When a borrower's end-customer pays an invoice (e.g., via Stripe or
 *   Tempo's payment rails), the gross settlement is routed here.
 *   MPPStreamingRepayer automatically:
 *     1. Calculates accrued interest on the drawn amount.
 *     2. Sends (principal + interest) to CredoVault — repaying the lenders.
 *     3. Sends the net surplus to the borrower's operational wallet.
 *
 * Tempo Integration:
 *   On Tempo Mainnet, this contract hooks into MPP payment streams so
 *   repayments happen atomically with no manual borrower intervention.
 *   Gas is paid in USDC, not in any native token.
 *
 * Repayment split example (Profile A):
 *   Invoice:   $45,000
 *   Advance:   $36,000 (80%)
 *   Interest:  $36,000 × 8.4% × 30/365 = ~$249 (for a 30-day term)
 *   To Vault:  $36,249 (principal + interest)
 *   To Borrower: $8,751 (net surplus)
 */
contract MPPStreamingRepayer is Ownable, ReentrancyGuard {
    // ── Constants ─────────────────────────────────────────────────────────────
    uint256 private constant SECONDS_PER_YEAR = 365 days;
    uint256 private constant BPS_DENOMINATOR = 10_000;

    /// @notice Protocol fee in basis points charged on interest (50 bps = 0.50%)
    uint256 public constant PROTOCOL_FEE_BPS = 50;

    // ── State ─────────────────────────────────────────────────────────────────
    IERC20 public usdc;
    CredoCreditManager public creditManager;
    CredoVault public vault;

    /// @notice Address authorized to receive collected protocol fees
    address public feeRecipient;

    /// @notice Cumulative protocol fees collected (USDC 6-dec)
    uint256 public totalProtocolFees;

    /// @notice Protocol fee collected per invoice hash
    mapping(bytes32 => uint256) public protocolFees;

    /// @notice Settlement records per invoice hash
    mapping(bytes32 => Settlement) public settlements;

    struct Settlement {
        address borrower;
        uint256 principalRepaid;
        uint256 interestPaid;
        uint256 surplusReleased;
        uint256 settledAt;
        bool settled;
    }

    // ── Events ────────────────────────────────────────────────────────────────
    event InvoiceSettled(
        bytes32 indexed invoiceHash,
        address indexed borrower,
        uint256 grossAmount,
        uint256 principalRepaid,
        uint256 interestPaid,
        uint256 surplusToOperations
    );
    event PartialRepayment(
        bytes32 indexed invoiceHash,
        address indexed borrower,
        uint256 amount
    );
    event ProtocolFeeCollected(
        bytes32 indexed invoiceHash,
        address indexed recipient,
        uint256 feeAmount
    );
    event FeeRecipientUpdated(
        address indexed oldRecipient,
        address indexed newRecipient
    );

    // ── Constructor ───────────────────────────────────────────────────────────
    constructor(address _usdc, address _creditManager, address _vault)
        Ownable(msg.sender)
    {
        usdc = IERC20(_usdc);
        creditManager = CredoCreditManager(_creditManager);
        vault = CredoVault(_vault);
        feeRecipient = msg.sender;
    }

    // ── Admin ─────────────────────────────────────────────────────────────────

    /**
     * @notice Updates the recipient address for protocol fees.
     */
    function setFeeRecipient(address _feeRecipient) external onlyOwner {
        require(_feeRecipient != address(0), "MPP: zero address");
        emit FeeRecipientUpdated(feeRecipient, _feeRecipient);
        feeRecipient = _feeRecipient;
    }

    // ── Core: MPP Settlement ──────────────────────────────────────────────────

    /**
     * @notice Called when an end-customer pays an invoice via Tempo MPP rails.
     *         Splits the gross payment between vault repayment and borrower surplus.
     *
     * @param invoiceHash  The keccak256 invoice identifier (matches CreditLine).
     * @param grossAmount  Total USDC received from the invoice payer (6 decimals).
     */
    function settleInvoicePayment(
        bytes32 invoiceHash,
        uint256 grossAmount
    ) external nonReentrant {
        require(grossAmount > 0, "MPP: zero settlement");
        require(!settlements[invoiceHash].settled, "MPP: already settled");

        // Resolve the borrower from the credit manager
        // (In production we'd look up by invoiceHash; here we require caller is borrower)
        address borrower = msg.sender;

        (
            ,
            uint256 drawnAmount,
            uint256 aprBps,
            bytes32 storedHash,
            ,
            uint64  approvedAt,
            bool    active,
            address lineSource
        ) = creditManager.creditLines(borrower);

        require(active, "MPP: no active credit line for sender");
        require(storedHash == invoiceHash, "MPP: invoice hash mismatch");

        // ── Pull gross USDC from caller ────────────────────────────────────
        require(
            usdc.transferFrom(msg.sender, address(this), grossAmount),
            "MPP: transfer failed"
        );

        // ── Calculate accrued interest ─────────────────────────────────────
        uint256 accruedInterest;
        {
            uint256 elapsed = block.timestamp > approvedAt
                ? block.timestamp - approvedAt
                : 0;

            accruedInterest = (drawnAmount * aprBps * elapsed) /
                (BPS_DENOMINATOR * SECONDS_PER_YEAR);
        }

        uint256 totalOwed = drawnAmount + accruedInterest;

        // ── Split the payment & apply 50bps fee on interest ────────────────
        uint256 protocolFee;
        uint256 toVault;
        uint256 toBorrower;

        if (grossAmount >= totalOwed) {
            protocolFee = (accruedInterest * PROTOCOL_FEE_BPS) / BPS_DENOMINATOR;
            uint256 netInterest = accruedInterest - protocolFee;
            toVault = drawnAmount + netInterest;
            toBorrower = grossAmount - totalOwed;
        } else {
            toBorrower = 0;
            if (grossAmount > drawnAmount) {
                uint256 interestPaid = grossAmount - drawnAmount;
                protocolFee = (interestPaid * PROTOCOL_FEE_BPS) / BPS_DENOMINATOR;
                uint256 netInterest = interestPaid - protocolFee;
                toVault = drawnAmount + netInterest;
            } else {
                protocolFee = 0;
                toVault = grossAmount;
            }
            emit PartialRepayment(invoiceHash, borrower, grossAmount);
        }

        // ── Route to the credit line's assigned liquidity source ───────────
        // Resolve target: use the credit line's liquiditySource if set,
        // otherwise fall back to the constructor-provided vault.
        address repayTarget = lineSource != address(0) ? lineSource : address(vault);

        if (toVault > 0) {
            usdc.approve(repayTarget, toVault);
            uint256 principalComponent = drawnAmount >= toVault ? toVault : drawnAmount;
            uint256 interestComponent = toVault > principalComponent ? toVault - principalComponent : 0;
            ILiquiditySource(repayTarget).executeRepayment(
                borrower,
                principalComponent,
                interestComponent
            );
        }

        // ── Route protocol fee ─────────────────────────────────────────────
        if (protocolFee > 0 && feeRecipient != address(0)) {
            totalProtocolFees += protocolFee;
            protocolFees[invoiceHash] += protocolFee;
            require(usdc.transfer(feeRecipient, protocolFee), "MPP: fee transfer failed");
            emit ProtocolFeeCollected(invoiceHash, feeRecipient, protocolFee);
        }

        // ── Release surplus to borrower's operational wallet ───────────────
        if (toBorrower > 0) {
            require(usdc.transfer(borrower, toBorrower), "MPP: surplus transfer failed");
        }

        // ── Mark settled ──────────────────────────────────────────────────
        settlements[invoiceHash] = Settlement({
            borrower: borrower,
            principalRepaid: drawnAmount,
            interestPaid: accruedInterest,
            surplusReleased: toBorrower,
            settledAt: block.timestamp,
            settled: (toVault + protocolFee) >= totalOwed
        });

        emit InvoiceSettled(
            invoiceHash,
            borrower,
            grossAmount,
            drawnAmount,
            accruedInterest,
            toBorrower
        );
    }

    /**
     * @notice Preview the repayment split for a given invoice and gross amount.
     * @return toVault      USDC to be sent to the liquidity source (principal + net interest)
     * @return toBorrower   USDC net surplus sent to borrower operations
     * @return interest     Accrued interest component
     * @return protocolFee  Protocol fee (50 bps on interest)
     */
    function previewSettlement(
        address borrower,
        uint256 grossAmount
    ) external view returns (
        uint256 toVault,
        uint256 toBorrower,
        uint256 interest,
        uint256 protocolFee
    ) {
        (
            ,
            uint256 drawnAmount,
            uint256 aprBps,
            ,
            ,
            uint64 approvedAt,
            bool active,
        ) = creditManager.creditLines(borrower);

        if (!active || drawnAmount == 0) return (0, grossAmount, 0, 0);

        uint256 elapsed = block.timestamp > approvedAt
            ? block.timestamp - approvedAt
            : 0;

        interest = (drawnAmount * aprBps * elapsed) /
            (BPS_DENOMINATOR * SECONDS_PER_YEAR);

        uint256 totalOwed = drawnAmount + interest;

        if (grossAmount >= totalOwed) {
            protocolFee = (interest * PROTOCOL_FEE_BPS) / BPS_DENOMINATOR;
            toVault = totalOwed - protocolFee;
            toBorrower = grossAmount - totalOwed;
        } else {
            toBorrower = 0;
            if (grossAmount > drawnAmount) {
                uint256 interestPaid = grossAmount - drawnAmount;
                protocolFee = (interestPaid * PROTOCOL_FEE_BPS) / BPS_DENOMINATOR;
                toVault = grossAmount - protocolFee;
            } else {
                protocolFee = 0;
                toVault = grossAmount;
            }
        }
    }
}
