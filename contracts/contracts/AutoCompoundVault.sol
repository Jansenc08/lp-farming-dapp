// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title AutoCompoundVault
 * @dev Accepts STK, mints vSTK receipts, stakes in StakingContract. compound() claims and restakes. withdraw burns vSTK and returns STK.
 */
contract AutoCompoundVault is ReentrancyGuard {
    using SafeERC20 for IERC20;

    IERC20 public immutable stakingToken;
    IStakingContract public immutable stakingContract;
    IVaultToken public immutable vaultToken;

    event Deposit(address indexed user, uint256 amount, uint256 shares);
    event Withdraw(address indexed user, uint256 shares, uint256 amount);
    event Compound(uint256 amountRestaked);

    constructor(address _stakingContract, address _vaultToken) {
        stakingContract = IStakingContract(_stakingContract);
        vaultToken = IVaultToken(_vaultToken);
        stakingToken = IStakingContract(_stakingContract).stakingToken();
    }

    function totalStaked() public view returns (uint256) {
        (uint256 amount, ) = stakingContract.userInfo(address(this));
        return amount;
    }

    function getPricePerShare() external view returns (uint256) {
        uint256 supply = vaultToken.totalSupply();
        if (supply == 0) return 1e18;
        return (totalStaked() * 1e18) / supply;
    }

    function deposit(uint256 _amount) external nonReentrant {
        require(_amount > 0, "AutoCompoundVault: zero amount");
        uint256 _totalStaked = totalStaked();
        uint256 _supply = vaultToken.totalSupply();
        uint256 shares;
        if (_supply == 0) {
            shares = _amount;
        } else {
            shares = (_amount * _supply) / _totalStaked;
        }
        stakingToken.safeTransferFrom(msg.sender, address(this), _amount);
        vaultToken.mint(msg.sender, shares);
        require(stakingToken.approve(address(stakingContract), _amount), "AutoCompoundVault: approve failed");
        stakingContract.deposit(_amount);
        emit Deposit(msg.sender, _amount, shares);
    }

    function withdraw(uint256 _shares) external nonReentrant {
        require(_shares > 0, "AutoCompoundVault: zero shares");
        uint256 _supply = vaultToken.totalSupply();
        uint256 _totalStaked = totalStaked();
        uint256 amount = (_shares * _totalStaked) / _supply;
        vaultToken.burn(msg.sender, _shares);
        stakingContract.withdraw(amount);
        stakingToken.safeTransfer(msg.sender, amount);
        emit Withdraw(msg.sender, _shares, amount);
    }

    function compound() external nonReentrant {
        uint256 pending = stakingContract.pendingReward(address(this));
        if (pending == 0) return;
        stakingContract.claim();
        stakingToken.approve(address(stakingContract), pending);
        stakingContract.deposit(pending);
        emit Compound(pending);
    }

    function pendingReward() external view returns (uint256) {
        return stakingContract.pendingReward(address(this));
    }
}

interface IStakingContract {
    function stakingToken() external view returns (IERC20);
    function userInfo(address user) external view returns (uint256 amount, uint256 rewardDebt);
    function deposit(uint256 amount) external;
    function withdraw(uint256 amount) external;
    function claim() external;
    function pendingReward(address user) external view returns (uint256);
}

interface IVaultToken {
    function totalSupply() external view returns (uint256);
    function mint(address to, uint256 amount) external;
    function burn(address from, uint256 amount) external;
}
