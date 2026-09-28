// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title ILiquiditySource
  *@author Credence_finance
 * @notice Standard interface for any vault or lending pool that Credence
 *         can route verified borrower drawdowns to and receive repayments from.
 *
 * Architecture:
 *   Credence acts as a credit verification middleware. It verifies borrower
 *   credentials via zkTLS attestations, manages credit lines, and enforces
 *   repayment routing. The actual capital comes from external liquidity sources
 *   that implement this interface.
 *
 *   Any ERC-4626 vault, Aave pool adapter, Morpho market adapter, or custom
 *   lending pool can implement ILiquiditySource to integrate with Credence.
 */
interface ILiquiditySource {
    /**
     * @notice Execute a borrower drawdown, transferring USDC to the borrower.
     * @param borrower The address receiving the funds.
     * @param amount   The USDC amount (6 decimals) to disburse.
     */
    function executeBorrow(address borrower, uint256 amount) external;

    /**
     * @notice Accept a repayment routed by Credence's MPP settlement layer.
     * @param borrower  The business repaying the loan.
     * @param principal The principal component of the repayment.
     * @param interest  The interest component (accrues to liquidity providers).
     */
    function executeRepayment(
        address borrower,
        uint256 principal,
        uint256 interest
    ) external;

    /**
     * @notice Returns total USDC available for new drawdowns.
     */
    function availableLiquidity() external view returns (uint256);
}
