// Addresses from env — no hardcoded addresses
const CHAIN_ID = parseInt(process.env.NEXT_PUBLIC_CHAIN_ID || "11155111", 10);

export const CONTRACT = {
  MASTERCHEF: process.env.NEXT_PUBLIC_MASTERCHEF_ADDRESS,
  REWARD_TOKEN: process.env.NEXT_PUBLIC_REWARD_TOKEN_ADDRESS,
  LP1: process.env.NEXT_PUBLIC_LP1_ADDRESS,
  LP2: process.env.NEXT_PUBLIC_LP2_ADDRESS,
  LP3: process.env.NEXT_PUBLIC_LP3_ADDRESS,
};

export const CHAIN_ID_SEPOLIA = 11155111;
export const APP_CHAIN_ID = CHAIN_ID;

export const POOLS = [
  { pid: 0, name: "LP1", symbol: "LP1", lpAddress: CONTRACT.LP1, allocationPercent: 50 },
  { pid: 1, name: "LP2", symbol: "LP2", lpAddress: CONTRACT.LP2, allocationPercent: 30 },
  { pid: 2, name: "LP3", symbol: "LP3", lpAddress: CONTRACT.LP3, allocationPercent: 20 },
];

export const REWARD_PER_BLOCK = "200";

// ERC20: balanceOf, approve, allowance, decimals
export const ERC20_ABI = [
  { inputs: [{ name: "account", type: "address" }], name: "balanceOf", outputs: [{ name: "", type: "uint256" }], stateMutability: "view", type: "function" },
  { inputs: [{ name: "spender", type: "address" }, { name: "amount", type: "uint256" }], name: "approve", outputs: [{ name: "", type: "bool" }], stateMutability: "nonpayable", type: "function" },
  { inputs: [{ name: "owner", type: "address" }, { name: "spender", type: "address" }], name: "allowance", outputs: [{ name: "", type: "uint256" }], stateMutability: "view", type: "function" },
  { inputs: [], name: "decimals", outputs: [{ name: "", type: "uint8" }], stateMutability: "view", type: "function" },
];

// MasterChef: deposit, withdraw, claim, pendingReward, userInfo, poolInfo, rewardPerBlock, poolLength
export const MASTERCHEF_ABI = [
  { inputs: [{ name: "_pid", type: "uint256" }, { name: "_amount", type: "uint256" }], name: "deposit", outputs: [], stateMutability: "nonpayable", type: "function" },
  { inputs: [{ name: "_pid", type: "uint256" }, { name: "_amount", type: "uint256" }], name: "withdraw", outputs: [], stateMutability: "nonpayable", type: "function" },
  { inputs: [{ name: "_pid", type: "uint256" }], name: "claim", outputs: [], stateMutability: "nonpayable", type: "function" },
  { inputs: [{ name: "_pid", type: "uint256" }, { name: "_user", type: "address" }], name: "pendingReward", outputs: [{ name: "", type: "uint256" }], stateMutability: "view", type: "function" },
  { inputs: [{ name: "", type: "uint256" }, { name: "", type: "address" }], name: "userInfo", outputs: [{ name: "amount", type: "uint256" }, { name: "rewardDebt", type: "uint256" }], stateMutability: "view", type: "function" },
  { inputs: [{ name: "", type: "uint256" }], name: "poolInfo", outputs: [{ name: "lpToken", type: "address" }, { name: "allocPoint", type: "uint256" }, { name: "lastRewardBlock", type: "uint256" }, { name: "accRewardPerShare", type: "uint256" }], stateMutability: "view", type: "function" },
  { inputs: [], name: "rewardPerBlock", outputs: [{ name: "", type: "uint256" }], stateMutability: "view", type: "function" },
  { inputs: [], name: "poolLength", outputs: [{ name: "", type: "uint256" }], stateMutability: "view", type: "function" },
];
