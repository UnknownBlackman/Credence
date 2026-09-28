// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title MockUSDC
 * @notice Simulates Tempo's native stablecoin gas token (USDC, 6 decimals).
 * @dev In production, this is replaced by real USDC on Tempo Mainnet.
 *      On Tempo, gas fees are denominated and paid directly in USDC —
 *      no native gas token is required.
 */
contract MockUSDC is ERC20, Ownable {
    uint8 private constant DECIMALS = 6;

    /// @notice How much USDC each faucet call dispenses (1,000 USDC)
    uint256 public constant FAUCET_AMOUNT = 1_000 * 10 ** 6;

    /// @notice Cooldown per address between faucet calls (24 hours)
    uint256 public constant FAUCET_COOLDOWN = 24 hours;

    mapping(address => uint256) public lastFaucetAt;

    event Faucet(address indexed recipient, uint256 amount);

    constructor() ERC20("USD Coin", "USDC") Ownable(msg.sender) {
        // Mint 10M USDC to deployer for seeding vaults
        _mint(msg.sender, 10_000_000 * 10 ** 6);
    }

    function decimals() public pure override returns (uint8) {
        return DECIMALS;
    }

    /**
     * @notice Hackathon faucet — anyone can call once per 24h to receive test USDC.
     */
    function faucet() external {
        require(
            lastFaucetAt[msg.sender] == 0 ||
            block.timestamp >= lastFaucetAt[msg.sender] + FAUCET_COOLDOWN,
            "MockUSDC: cooldown active"
        );
        lastFaucetAt[msg.sender] = block.timestamp;
        _mint(msg.sender, FAUCET_AMOUNT);
        emit Faucet(msg.sender, FAUCET_AMOUNT);
    }

    /**
     * @notice Owner-only mint for test scaffolding.
     */
    function mint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
    }
}
