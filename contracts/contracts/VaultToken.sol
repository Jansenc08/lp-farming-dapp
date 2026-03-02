// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title VaultToken
 * @dev Receipt token "Vault Token" (vSTK). Only owner (AutoCompoundVault) can mint and burn.
 */
contract VaultToken is ERC20, Ownable {
    constructor() ERC20("Vault Token", "vSTK") Ownable(msg.sender) {}

    function mint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
    }

    function burn(address from, uint256 amount) external onlyOwner {
        _burn(from, amount);
    }
}
