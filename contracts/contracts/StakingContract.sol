// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title StakingContract
 * @dev Users deposit STK, earn 10 STK per block. Same token in, same token out.
 */
contract StakingContract is ReentrancyGuard, Ownable {
    using SafeERC20 for IERC20;

    IERC20 public immutable stakingToken;
    uint256 public constant REWARD_PER_BLOCK = 10 * 10 ** 18;
    uint256 public constant ACC_PRECISION = 1e12;

    uint256 public totalStaked;
    uint256 public lastRewardBlock;
    uint256 public accRewardPerShare;

    struct UserInfo {
        uint256 amount;
        uint256 rewardDebt;
    }
    mapping(address => UserInfo) public userInfo;

    event Deposit(address indexed user, uint256 amount);
    event Withdraw(address indexed user, uint256 amount);
    event Claim(address indexed user, uint256 amount);

    constructor(IERC20 _stakingToken) Ownable(msg.sender) {
        stakingToken = _stakingToken;
        lastRewardBlock = block.number;
    }

    function _updatePool() internal {
        if (block.number <= lastRewardBlock) return;
        if (totalStaked == 0) {
            lastRewardBlock = block.number;
            return;
        }
        uint256 blocks = block.number - lastRewardBlock;
        uint256 reward = blocks * REWARD_PER_BLOCK;
        accRewardPerShare += (reward * ACC_PRECISION) / totalStaked;
        lastRewardBlock = block.number;
    }

    function pendingReward(address _user) external view returns (uint256) {
        UserInfo storage user = userInfo[_user];
        uint256 _accRewardPerShare = accRewardPerShare;
        if (block.number > lastRewardBlock && totalStaked != 0) {
            uint256 blocks = block.number - lastRewardBlock;
            _accRewardPerShare += (blocks * REWARD_PER_BLOCK * ACC_PRECISION) / totalStaked;
        }
        return (user.amount * _accRewardPerShare) / ACC_PRECISION - user.rewardDebt;
    }

    function deposit(uint256 _amount) external nonReentrant {
        _updatePool();
        UserInfo storage user = userInfo[msg.sender];
        if (user.amount > 0) {
            uint256 pending = (user.amount * accRewardPerShare) / ACC_PRECISION - user.rewardDebt;
            if (pending > 0) {
                _mintReward(msg.sender, pending);
                emit Claim(msg.sender, pending);
            }
        }
        if (_amount > 0) {
            stakingToken.safeTransferFrom(msg.sender, address(this), _amount);
            user.amount += _amount;
            totalStaked += _amount;
            emit Deposit(msg.sender, _amount);
        }
        user.rewardDebt = (user.amount * accRewardPerShare) / ACC_PRECISION;
    }

    function withdraw(uint256 _amount) external nonReentrant {
        UserInfo storage user = userInfo[msg.sender];
        require(user.amount >= _amount, "StakingContract: insufficient balance");
        _updatePool();
        uint256 pending = (user.amount * accRewardPerShare) / ACC_PRECISION - user.rewardDebt;
        if (pending > 0) {
            _mintReward(msg.sender, pending);
            emit Claim(msg.sender, pending);
        }
        if (_amount > 0) {
            user.amount -= _amount;
            totalStaked -= _amount;
            stakingToken.safeTransfer(msg.sender, _amount);
            emit Withdraw(msg.sender, _amount);
        }
        user.rewardDebt = (user.amount * accRewardPerShare) / ACC_PRECISION;
    }

    function claim() external nonReentrant {
        _updatePool();
        UserInfo storage user = userInfo[msg.sender];
        uint256 pending = (user.amount * accRewardPerShare) / ACC_PRECISION - user.rewardDebt;
        if (pending > 0) {
            user.rewardDebt = (user.amount * accRewardPerShare) / ACC_PRECISION;
            _mintReward(msg.sender, pending);
            emit Claim(msg.sender, pending);
        }
    }

    function emergencyWithdraw() external nonReentrant {
        UserInfo storage user = userInfo[msg.sender];
        uint256 amount = user.amount;
        user.amount = 0;
        user.rewardDebt = 0;
        totalStaked -= amount;
        if (amount > 0) {
            stakingToken.safeTransfer(msg.sender, amount);
            emit Withdraw(msg.sender, amount);
        }
    }

    function _mintReward(address to, uint256 amount) internal {
        (bool ok, ) = address(stakingToken).call(abi.encodeWithSignature("mint(address,uint256)", to, amount));
        require(ok, "StakingContract: mint failed");
    }
}
