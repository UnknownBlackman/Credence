// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Script.sol";
import "../src/MockUSDC.sol";
import "../src/CredoVault.sol";
import "../src/CredoCreditManager.sol";
import "../src/MPPStreamingRepayer.sol";

/**
 * @title DeployScript
 * @notice Foundry deployment script for Credence on Tempo Moderato Testnet or local EVM.
 *
 * Architecture:
 *   Credence deploys as a credit verification middleware. CredoVault is
 *   deployed as the default ILiquiditySource, but the protocol supports
 *   plugging in any ERC-4626 vault, Aave adapter, or Morpho market via
 *   the ILiquiditySource interface and the CreditManager's source registry.
 *
 * Usage:
 *   forge script script/Deploy.s.sol:DeployScript --rpc-url moderato --broadcast
 */
contract DeployScript is Script {
    function run()
        external
        returns (
            MockUSDC usdc,
            CredoVault vault,
            CredoCreditManager creditManager,
            MPPStreamingRepayer mppRepayer
        )
    {
        uint256 deployerPrivateKey = vm.envOr(
            "PRIVATE_KEY",
            uint256(0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80)
        );
        address deployer = vm.addr(deployerPrivateKey);

        // Notary oracle default: use second hardhat/foundry test key or env
        address notaryOracle = vm.envOr(
            "NOTARY_ORACLE_ADDRESS",
            address(0x70997970C51812dc3A010C7d01b50e0d17dc79C8)
        );

        console.log("=== Deploying Credence Protocol (Middleware Architecture) ===");
        console.log("Deployer:", deployer);
        console.log("Notary Oracle:", notaryOracle);

        vm.startBroadcast(deployerPrivateKey);

        // 1. Deploy MockUSDC
        usdc = new MockUSDC();
        console.log("MockUSDC deployed at:", address(usdc));

        // 2. Deploy CredoVault (default ILiquiditySource)
        vault = new CredoVault(address(usdc));
        console.log("CredoVault (default ILiquiditySource) deployed at:", address(vault));

        // 3. Deploy CredoCreditManager (vault as default liquidity source)
        creditManager = new CredoCreditManager(address(vault), notaryOracle);
        console.log("CredoCreditManager deployed at:", address(creditManager));

        // 4. Deploy MPPStreamingRepayer
        mppRepayer = new MPPStreamingRepayer(
            address(usdc),
            address(creditManager),
            address(vault)
        );
        console.log("MPPStreamingRepayer deployed at:", address(mppRepayer));

        // 5. Authorize CreditManager and MPPRepayer on Vault
        vault.setCreditManager(address(creditManager));
        vault.setMPPRepayer(address(mppRepayer));
        console.log("CreditManager & MPPRepayer authorized on CredoVault");

        // 6. Seed vault with 500,000 USDC
        uint256 seedAmount = 500_000 * 10 ** 6;
        usdc.approve(address(vault), seedAmount);
        vault.deposit(seedAmount, deployer);
        console.log("CredoVault seeded with 500,000 USDC");

        console.log("");
        console.log("=== Middleware Architecture Ready ===");
        console.log("Default ILiquiditySource:", address(vault));
        console.log("Additional sources can be registered via:");
        console.log("  creditManager.setApprovedSource(adapterAddress, true)");

        vm.stopBroadcast();
    }
}
