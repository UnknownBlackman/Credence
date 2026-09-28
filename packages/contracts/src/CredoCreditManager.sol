// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/utils/cryptography/EIP712.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "./ILiquiditySource.sol";

/**
 * @title CredoCreditManager
 * @author Credence_finance
 * @notice Core underwriting engine for Credence.
 *
 * Flow:
 *   1. An off-chain zkTLS Notary Oracle signs an UnderwritingAttestation proving
 *      a business's verified Stripe cash flow (PII-redacted). (c. Should not be limited to stripe)
 *   2. The business submits this attestation on-chain via verifyAndApproveCredit().
 *   3. CredoCreditManager validates the signature, checks eligibility rules,
 *      and issues a time-bounded credit line.
 *   4. The business calls drawdown() to receive USDC from CredoVault.
 *
 * Tempo Integration: c. Remove these comments before submission
 *   All USDC flows settle on Tempo with gas fees paid directly in USDC
 *   (no native gas token needed). Repayments auto-stream via MPPStreamingRepayer.
 */
contract CredoCreditManager is EIP712, Ownable, ReentrancyGuard {
    using ECDSA for bytes32;

    // ── Types ─────────────────────────────────────────────────────────────────

    struct UnderwritingAttestation {
        bytes32 businessIdHash;      // keccak256 of business legal entity (PII-redacted)
        uint256 trailing90dRevenue;  // Verified 90-day gross volume, USDC 6-decimal
        uint256 disputeRateBps;      // Verified dispute/chargeback rate in basis points
        uint256 invoiceFaceValue;    // Verified outstanding invoice amount, USDC 6-decimal
        uint64  invoiceDueDate;      // Unix timestamp of invoice maturity
        bytes32 invoiceHash;         // keccak256(invoiceId + salt) — PII-free identifier
        uint256 timestamp;           // When this attestation was generated (unix)
        bytes signature;           // ECDSA signature from the zkTLS Notary Oracle
    }

    struct CreditLine {
        uint256 approvedLimit;       // Max USDC drawable (advance rate * invoice face value)
        uint256 drawnAmount;         // USDC already drawn
        uint256 aprBps;              // Annualised interest rate in basis points
        bytes32 invoiceHash;         // Tied to a specific invoice
        uint64  invoiceDueDate;      // Repayment deadline
        uint64  approvedAt;          // Block timestamp of approval
        bool    active;              // Whether the credit line is live
        address liquiditySource;     // ILiquiditySource that funds drawdowns for this line
    }

    // ── EIP-712 type hash ─────────────────────────────────────────────────────
    bytes32 public constant ATTESTATION_TYPEHASH = keccak256(
        "UnderwritingAttestation(bytes32 businessIdHash,uint256 trailing90dRevenue,"
        "uint256 disputeRateBps,uint256 invoiceFaceValue,uint64 invoiceDueDate,"
        "bytes32 invoiceHash,uint256 timestamp)"
    );

    // ── Configuration constants ───────────────────────────────────────────────
    /// @notice Maximum age of a zkTLS attestation before it's considered stale
    uint256 public constant ATTESTATION_TTL = 1 hours;

    /// @notice Maximum dispute rate allowed for credit approval (1% = 100 bps)
    uint256 public constant MAX_DISPUTE_RATE_BPS = 100;

    /// @notice Revenue must be at least 2× the invoice face value
    uint256 public constant MIN_REVENUE_COVERAGE_MULTIPLE = 2;

    /// @notice Advance rate: 80% of invoice face value
    uint256 public constant ADVANCE_RATE_BPS = 8_000; // 80% in bps

    /// @notice Base APR: 8% per annum
    uint256 public constant BASE_APR_BPS = 800;

    // ── State ─────────────────────────────────────────────────────────────────
    /// @notice The zkTLS Notary Oracle's signing address (set by owner)
    address public notaryOracle;

    /// @notice Active credit lines by borrower address
    mapping(address => CreditLine) public creditLines;

    /// @notice Prevents invoice hash reuse across different borrowers
    mapping(bytes32 => bool) public usedInvoiceHashes;

    /// @notice The default ILiquiditySource used when no specific source is requested
    ILiquiditySource public defaultSource;

    /// @notice Registry of approved liquidity sources (vault adapters)
    mapping(address => bool) public approvedSources;

    // ── Events ────────────────────────────────────────────────────────────────
    event CreditApproved(
        address indexed borrower,
        uint256 approvedLimit,
        uint256 aprBps,
        bytes32 indexed invoiceHash,
        address indexed liquiditySource
    );
    event FundsDrawn(address indexed borrower, uint256 amount, uint256 remainingCredit);
    event NotaryOracleUpdated(address indexed oldOracle, address indexed newOracle);
    event LiquiditySourceApproved(address indexed source, bool approved);
    event DefaultSourceUpdated(address indexed oldSource, address indexed newSource);

    // ── Constructor ───────────────────────────────────────────────────────────
    constructor(address _defaultSource, address _notaryOracle)
        EIP712("Credence", "1")
        Ownable(msg.sender)
    {
        defaultSource = ILiquiditySource(_defaultSource);
        approvedSources[_defaultSource] = true;
        notaryOracle = _notaryOracle;
    }

    // ── Admin ─────────────────────────────────────────────────────────────────

    function setNotaryOracle(address _oracle) external onlyOwner {
        emit NotaryOracleUpdated(notaryOracle, _oracle);
        notaryOracle = _oracle;
    }

    /**
     * @notice Approve or revoke a liquidity source (vault adapter) for use with Credence.
     */
    function setApprovedSource(address _source, bool _approved) external onlyOwner {
        approvedSources[_source] = _approved;
        emit LiquiditySourceApproved(_source, _approved);
    }

    /**
     * @notice Update the default liquidity source used when borrowers do not specify one.
     */
    function setDefaultSource(address _source) external onlyOwner {
        require(approvedSources[_source], "CreditManager: source not approved");
        emit DefaultSourceUpdated(address(defaultSource), _source);
        defaultSource = ILiquiditySource(_source);
    }

    /**
     * @notice Submit a zkTLS attestation to be underwritten and receive a credit line.
     * @dev Signature must be from the authorised notaryOracle address.
     *      Uses the default liquidity source. Call verifyAndApproveCreditFrom()
     *      to specify a particular approved source.
     */
    function verifyAndApproveCredit(
        UnderwritingAttestation calldata attestation
    ) external nonReentrant {
        _verifyAndApprove(attestation, address(defaultSource));
    }

    /**
     * @notice Submit a zkTLS attestation and specify which liquidity source to draw from.
     * @param attestation  The signed zkTLS underwriting attestation.
     * @param source       An approved ILiquiditySource to fund this credit line.
     */
    function verifyAndApproveCreditFrom(
        UnderwritingAttestation calldata attestation,
        address source
    ) external nonReentrant {
        require(approvedSources[source], "CreditManager: source not approved");
        _verifyAndApprove(attestation, source);
    }

    function _verifyAndApprove(
        UnderwritingAttestation calldata attestation,
        address source
    ) internal {
        // ── 1. Timestamp freshness ────────────────────────────────────────────
        require(
            block.timestamp <= attestation.timestamp + ATTESTATION_TTL,
            "CreditManager: attestation expired"
        );
        require(
            attestation.timestamp <= block.timestamp,
            "CreditManager: attestation from future"
        );

        // ── 2. Invoice has not already been factored ──────────────────────────
        require(
            !usedInvoiceHashes[attestation.invoiceHash],
            "CreditManager: invoice already factored"
        );

        // ── 3. Invoice not already past due ──────────────────────────────────
        require(
            attestation.invoiceDueDate > block.timestamp,
            "CreditManager: invoice already past due"
        );

        // ── 4. Eligibility checks ─────────────────────────────────────────────
        require(
            attestation.disputeRateBps <= MAX_DISPUTE_RATE_BPS,
            "CreditManager: dispute rate too high"
        );
        require(
            attestation.trailing90dRevenue >=
                attestation.invoiceFaceValue * MIN_REVENUE_COVERAGE_MULTIPLE,
            "CreditManager: insufficient revenue coverage"
        );
        require(
            attestation.invoiceFaceValue > 0,
            "CreditManager: zero invoice value"
        );

        // ── 5. Verify zkTLS Notary signature ──────────────────────────────────
        bytes32 structHash = keccak256(abi.encode(
            ATTESTATION_TYPEHASH,
            attestation.businessIdHash,
            attestation.trailing90dRevenue,
            attestation.disputeRateBps,
            attestation.invoiceFaceValue,
            attestation.invoiceDueDate,
            attestation.invoiceHash,
            attestation.timestamp
        ));
        bytes32 digest = _hashTypedDataV4(structHash);
        address recovered = digest.recover(attestation.signature);
        require(recovered == notaryOracle, "CreditManager: invalid notary signature");

        // ── 6. Calculate credit terms ─────────────────────────────────────────
        // Advance Rate: 80% of invoice face value
        uint256 approvedLimit = (attestation.invoiceFaceValue * ADVANCE_RATE_BPS) / 10_000;

        // Dynamic APR: base 8% + risk modifier (higher dispute rate = higher cost)
        // Risk modifier: disputeRateBps / 10 additional bps (max +10 bps at 100 bps dispute)
        uint256 aprBps = BASE_APR_BPS + (attestation.disputeRateBps / 10);

        // ── 7. Mark invoice as used and store credit line ─────────────────────
        usedInvoiceHashes[attestation.invoiceHash] = true;

        creditLines[msg.sender] = CreditLine({
            approvedLimit: approvedLimit,
            drawnAmount: 0,
            aprBps: aprBps,
            invoiceHash: attestation.invoiceHash,
            invoiceDueDate: attestation.invoiceDueDate,
            approvedAt: uint64(block.timestamp),
            active: true,
            liquiditySource: source
        });

        emit CreditApproved(msg.sender, approvedLimit, aprBps, attestation.invoiceHash, source);
    }

    // ── Core: Drawdown ────────────────────────────────────────────────────────

    /**
     * @notice Draw USDC from the assigned liquidity source against an approved credit line.
     * @param amount USDC amount (6 decimals) to draw down.
     */
    function drawdown(uint256 amount) external nonReentrant {
        CreditLine storage line = creditLines[msg.sender];
        require(line.active, "CreditManager: no active credit line");
        require(amount > 0, "CreditManager: zero drawdown");

        uint256 remaining = line.approvedLimit - line.drawnAmount;
        require(amount <= remaining, "CreditManager: exceeds credit limit");

        line.drawnAmount += amount;

        ILiquiditySource(line.liquiditySource).executeBorrow(msg.sender, amount);

        emit FundsDrawn(msg.sender, amount, line.approvedLimit - line.drawnAmount);
    }

    // ── View helpers ──────────────────────────────────────────────────────────

    /**
     * @notice Returns remaining drawable amount for a borrower.
     */
    function remainingCredit(address borrower) external view returns (uint256) {
        CreditLine storage line = creditLines[borrower];
        if (!line.active) return 0;
        return line.approvedLimit - line.drawnAmount;
    }

    /**
     * @notice Returns the EIP-712 domain separator (useful for off-chain signing).
     */
    function domainSeparator() external view returns (bytes32) {
        return _domainSeparatorV4();
    }
}
