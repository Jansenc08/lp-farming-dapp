// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

interface IRewardToken {
    function mint(address to, uint256 amount) external;
}

/**
 * @title MasterChef
 * @dev Farm contract: users deposit LP tokens to earn FRT rewards. 200 FRT per block split by allocation points.
 */
contract MasterChef is ReentrancyGuard, Ownable {
    using SafeERC20 for IERC20;

    /// @dev Reward token (FRT)
    IERC20 public immutable rewardToken;

    /// @dev FRT reward per block (total, split across pools by allocPoint)
    uint256 public rewardPerBlock;

    /// @dev Start block for reward accrual
    uint256 public startBlock;

    /// @dev Total allocation points across all pools
    uint256 public totalAllocPoint;

    /// @dev Precision for reward math
    uint256 private constant ACC_REWARD_PRECISION = 1e12;

    struct PoolInfo {
        IERC20 lpToken;
        uint256 allocPoint;
        uint256 lastRewardBlock;
        uint256 accRewardPerShare;
    }

    struct UserInfo {
        uint256 amount;
        uint256 rewardDebt;
    }

    PoolInfo[] public poolInfo;
    mapping(uint256 pid => mapping(address user => UserInfo)) public userInfo;
    /// @dev Track LP tokens already added to prevent duplicates
    mapping(address lpToken => bool) public lpTokenAdded;

    event Deposit(address indexed user, uint256 indexed pid, uint256 amount);
    event Withdraw(address indexed user, uint256 indexed pid, uint256 amount);
    event Claim(address indexed user, uint256 indexed pid, uint256 amount);
    event EmergencyWithdraw(address indexed user, uint256 indexed pid, uint256 amount);
    event PoolAdded(uint256 indexed pid, address lpToken, uint256 allocPoint);
    event RewardPerBlockUpdated(uint256 oldRate, uint256 newRate);
    event AllocPointUpdated(uint256 indexed pid, uint256 allocPoint);

    constructor(IERC20 _rewardToken, uint256 _rewardPerBlock, uint256 _startBlock) Ownable(msg.sender) {
        rewardToken = _rewardToken;
        rewardPerBlock = _rewardPerBlock;
        startBlock = _startBlock;
    }

    function poolLength() external view returns (uint256) {
        return poolInfo.length;
    }

    /**
     * @dev Add a new LP pool. Owner only. Reverts if LP token already added.
     */
    function add(uint256 _allocPoint, IERC20 _lpToken) external onlyOwner {
        require(address(_lpToken) != address(0), "MasterChef: zero address");
        require(!lpTokenAdded[address(_lpToken)], "MasterChef: LP token already added");
        lpTokenAdded[address(_lpToken)] = true;

        massUpdatePools();
        totalAllocPoint += _allocPoint;
        poolInfo.push(PoolInfo({
            lpToken: _lpToken,
            allocPoint: _allocPoint,
            lastRewardBlock: block.number > startBlock ? block.number : startBlock,
            accRewardPerShare: 0
        }));
        emit PoolAdded(poolInfo.length - 1, address(_lpToken), _allocPoint);
    }

    /**
     * @dev Update allocation points for a pool. Owner only.
     */
    function set(uint256 _pid, uint256 _allocPoint) external onlyOwner {
        require(_pid < poolInfo.length, "MasterChef: invalid pid");
        massUpdatePools();
        PoolInfo storage pool = poolInfo[_pid];
        totalAllocPoint = totalAllocPoint - pool.allocPoint + _allocPoint;
        pool.allocPoint = _allocPoint;
        emit AllocPointUpdated(_pid, _allocPoint);
    }

    /**
     * @dev Update reward per block. Owner only.
     */
    function setRewardPerBlock(uint256 _rewardPerBlock) external onlyOwner {
        uint256 oldRate = rewardPerBlock;
        rewardPerBlock = _rewardPerBlock;
        emit RewardPerBlockUpdated(oldRate, _rewardPerBlock);
    }

    function massUpdatePools() public {
        for (uint256 i = 0; i < poolInfo.length; i++) {
            updatePool(i);
        }
    }

    function updatePool(uint256 _pid) public {
        PoolInfo storage pool = poolInfo[_pid];
        if (block.number <= pool.lastRewardBlock) return;
        uint256 lpSupply = pool.lpToken.balanceOf(address(this));
        if (lpSupply == 0) {
            pool.lastRewardBlock = block.number;
            return;
        }
        uint256 blocks = block.number - pool.lastRewardBlock;
        uint256 reward = (blocks * rewardPerBlock * pool.allocPoint) / totalAllocPoint;
        pool.accRewardPerShare += (reward * ACC_REWARD_PRECISION) / lpSupply;
        pool.lastRewardBlock = block.number;
    }

    /**
     * @dev Pending FRT reward for user in pool (view). Does not update state.
     */
    function pendingReward(uint256 _pid, address _user) external view returns (uint256) {
        require(_pid < poolInfo.length, "MasterChef: invalid pid");
        PoolInfo storage pool = poolInfo[_pid];
        UserInfo storage user = userInfo[_pid][_user];
        uint256 accRewardPerShare = pool.accRewardPerShare;
        uint256 lpSupply = pool.lpToken.balanceOf(address(this));
        if (block.number > pool.lastRewardBlock && lpSupply != 0 && totalAllocPoint != 0) {
            uint256 blocks = block.number - pool.lastRewardBlock;
            uint256 reward = (blocks * rewardPerBlock * pool.allocPoint) / totalAllocPoint;
            accRewardPerShare += (reward * ACC_REWARD_PRECISION) / lpSupply;
        }
        return (user.amount * accRewardPerShare) / ACC_REWARD_PRECISION - user.rewardDebt;
    }

    /**
     * @dev Deposit LP tokens. Automatically claims pending rewards.
     */
    function deposit(uint256 _pid, uint256 _amount) external nonReentrant {
        require(_pid < poolInfo.length, "MasterChef: invalid pid");
        PoolInfo storage pool = poolInfo[_pid];
        UserInfo storage user = userInfo[_pid][msg.sender];
        updatePool(_pid);
        if (user.amount > 0) {
            uint256 pending = (user.amount * pool.accRewardPerShare) / ACC_REWARD_PRECISION - user.rewardDebt;
            if (pending > 0) {
                IRewardToken(address(rewardToken)).mint(msg.sender, pending);
                emit Claim(msg.sender, _pid, pending);
            }
        }
        if (_amount > 0) {
            pool.lpToken.safeTransferFrom(msg.sender, address(this), _amount);
            user.amount += _amount;
            emit Deposit(msg.sender, _pid, _amount);
        }
        user.rewardDebt = (user.amount * pool.accRewardPerShare) / ACC_REWARD_PRECISION;
    }

    /**
     * @dev Withdraw LP tokens. Automatically claims pending rewards.
     */
    function withdraw(uint256 _pid, uint256 _amount) external nonReentrant {
        require(_pid < poolInfo.length, "MasterChef: invalid pid");
        PoolInfo storage pool = poolInfo[_pid];
        UserInfo storage user = userInfo[_pid][msg.sender];
        require(user.amount >= _amount, "MasterChef: insufficient balance");
        updatePool(_pid);
        uint256 pending = (user.amount * pool.accRewardPerShare) / ACC_REWARD_PRECISION - user.rewardDebt;
        if (pending > 0) {
            IRewardToken(address(rewardToken)).mint(msg.sender, pending);
            emit Claim(msg.sender, _pid, pending);
        }
        if (_amount > 0) {
            user.amount -= _amount;
            pool.lpToken.safeTransfer(msg.sender, _amount);
            emit Withdraw(msg.sender, _pid, _amount);
        }
        user.rewardDebt = (user.amount * pool.accRewardPerShare) / ACC_REWARD_PRECISION;
    }

    /**
     * @dev Claim pending rewards without withdrawing LP.
     */
    function claim(uint256 _pid) external nonReentrant {
        require(_pid < poolInfo.length, "MasterChef: invalid pid");
        PoolInfo storage pool = poolInfo[_pid];
        UserInfo storage user = userInfo[_pid][msg.sender];
        updatePool(_pid);
        uint256 pending = (user.amount * pool.accRewardPerShare) / ACC_REWARD_PRECISION - user.rewardDebt;
        if (pending > 0) {
            user.rewardDebt = (user.amount * pool.accRewardPerShare) / ACC_REWARD_PRECISION;
            IRewardToken(address(rewardToken)).mint(msg.sender, pending);
            emit Claim(msg.sender, _pid, pending);
        }
    }

    /**
     * @dev Withdraw LP without claiming rewards. Use in emergencies.
     */
    function emergencyWithdraw(uint256 _pid) external nonReentrant {
        require(_pid < poolInfo.length, "MasterChef: invalid pid");
        PoolInfo storage pool = poolInfo[_pid];
        UserInfo storage user = userInfo[_pid][msg.sender];
        uint256 amount = user.amount;
        user.amount = 0;
        user.rewardDebt = 0;
        if (amount > 0) {
            pool.lpToken.safeTransfer(msg.sender, amount);
            emit EmergencyWithdraw(msg.sender, _pid, amount);
        }
    }
}
