// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/extensions/ERC4626.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "./ILiquiditySource.sol";

/**
 * @title CredoVault
 *@author Credence_finance
 * @notice ERC-4626 compliant liquidity vault where lenders deposit USDC to earn
 *         yield from real-world invoice factoring on Tempo.
 *
 * Lenders:
 *   - Deposit USDC → receive credoUSDC shares (representing proportional pool ownership)
 *   - Earn yield from borrower interest payments routed via MPPStreamingRepayer
 *   - Withdraw USDC at any time (subject to liquidity availability)
 *
 * Architecture:
 *   CredoCreditManager is the sole authorized "operator" allowed to pull
 *   USDC for borrower drawdowns and push repayments back in.
 */
contract CredoVault is ERC4626, Ownable, ReentrancyGuard, ILiquiditySource {
    /// @notice The CredoCreditManager contract authorized to call drawdown/repay
    address public creditManager;

    /// @notice The MPPStreamingRepayer contract authorized to push repayments
    address public mppRepayer;

    /// @notice Total interest ever accrued back to the vault
    uint256 public totalInterestEarned;

    // ── Events ────────────────────────────────────────────────────────────────
    event CreditManagerUpdated(address indexed oldManager, address indexed newManager);
    event MPPRepayerUpdated(address indexed oldRepayer, address indexed newRepayer);
    event DrawdownExecuted(address indexed borrower, uint256 amount);
    event RepaymentReceived(address indexed borrower, uint256 principal, uint256 interest);

    // ── Modifiers ─────────────────────────────────────────────────────────────
    modifier onlyCreditManager() {
        require(msg.sender == creditManager, "CredoVault: caller is not CreditManager");
        _;
    }

    modifier onlyAuthorizedRepayer() {
        require(
            msg.sender == creditManager || msg.sender == mppRepayer,
            "CredoVault: caller is not authorized repayer"
        );
        _;
    }

    constructor(address _usdc)
        ERC4626(IERC20(_usdc))
        ERC20("Credence USD", "crdnUSDC")
        Ownable(msg.sender)
    {}

    // ── Admin ─────────────────────────────────────────────────────────────────

    /**
     * @notice Sets the authorized CredoCreditManager address.
     * @dev Called once after deploying CredoCreditManager.
     */
    function setCreditManager(address _creditManager) external onlyOwner {
        emit CreditManagerUpdated(creditManager, _creditManager);
        creditManager = _creditManager;
    }

    /**
     * @notice Sets the authorized MPPStreamingRepayer address.
     */
    function setMPPRepayer(address _mppRepayer) external onlyOwner {
        emit MPPRepayerUpdated(mppRepayer, _mppRepayer);
        mppRepayer = _mppRepayer;
    }

    // ── CreditManager-only operations ─────────────────────────────────────────

    /**
     * @notice Pulls USDC from the vault to fund a borrower drawdown.
     * @dev Called by CredoCreditManager.drawdown(). Reverts if insufficient liquidity.
     */
    function executeDrawdown(address borrower, uint256 amount) external onlyCreditManager nonReentrant {
        _executeBorrow(borrower, amount);
    }

    /**
     * @notice ILiquiditySource implementation: execute a borrower drawdown.
     * @dev Called by CredoCreditManager via the ILiquiditySource interface.
     */
    function executeBorrow(address borrower, uint256 amount) external override onlyCreditManager nonReentrant {
        _executeBorrow(borrower, amount);
    }

    function _executeBorrow(address borrower, uint256 amount) internal {
        require(
            IERC20(asset()).balanceOf(address(this)) >= amount,
            "CredoVault: insufficient liquidity"
        );
        IERC20(asset()).transfer(borrower, amount);
        emit DrawdownExecuted(borrower, amount);
    }

    /**
     * @notice Accepts a repayment from MPPStreamingRepayer or CredoCreditManager.
     * @param borrower   The business repaying the loan.
     * @param principal  The principal component of the repayment.
     * @param interest   The interest component of the repayment.
     */
    function receiveRepayment(
        address borrower,
        uint256 principal,
        uint256 interest
    ) external onlyAuthorizedRepayer nonReentrant {
        _executeRepayment(borrower, principal, interest);
    }

    /**
     * @notice ILiquiditySource implementation: accept a repayment.
     * @dev Called by MPPStreamingRepayer via the ILiquiditySource interface.
     */
    function executeRepayment(
        address borrower,
        uint256 principal,
        uint256 interest
    ) external override onlyAuthorizedRepayer nonReentrant {
        _executeRepayment(borrower, principal, interest);
    }

    function _executeRepayment(address borrower, uint256 principal, uint256 interest) internal {
        uint256 total = principal + interest;
        require(
            IERC20(asset()).transferFrom(msg.sender, address(this), total),
            "CredoVault: repayment transfer failed"
        );
        totalInterestEarned += interest;
        emit RepaymentReceived(borrower, principal, interest);
    }

    // ── View helpers ──────────────────────────────────────────────────────────

    /**
     * @notice Returns total USDC available for drawdowns (undeployed liquidity).
     */
    function availableLiquidity() external view returns (uint256) {
        return IERC20(asset()).balanceOf(address(this));
    }

    /**
     * @notice Current annualised yield approximation for display on the lender dashboard.
     * @dev Simplified: interest / totalAssets. In production use time-weighted returns.
     */
    function currentApyBps() external view returns (uint256) {
        uint256 assets = totalAssets();
        if (assets == 0 || totalInterestEarned == 0) return 0;
        // Represent as basis points (1 bps = 0.01%)
        return (totalInterestEarned * 10_000) / assets;
    }
}
