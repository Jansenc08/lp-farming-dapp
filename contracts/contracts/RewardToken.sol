// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title RewardToken
 * @dev ERC20 "Farm Reward Token" (FRT). Only owner can mint. No initial supply.
 */
contract RewardToken is ERC20, Ownable {
    constructor() ERC20("Farm Reward Token", "FRT") Ownable(msg.sender) {}

    /**
     * @dev Mint new FRT tokens. Only callable by owner.
     */
    function mint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
    }
}
