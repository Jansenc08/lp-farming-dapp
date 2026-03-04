# FarmX — Decentralised LP Token Farming DApp

A decentralised LP Token Farming DApp built on Ethereum Sepolia testnet. Users can deposit LP tokens to earn FRT rewards, and deposit STK tokens into an auto-compound vault to earn more STK automatically.

## Live Demo

- **Farm:** https://lp-farming-dapp.vercel.app
- **Vault:** https://lp-farming-dapp.vercel.app/vault

## Features

### LP Token Farming
- Deposit LP tokens into farming pools to earn FRT rewards
- 200 FRT reward tokens distributed per block across 3 pools
- 3 pools with 50:30:20 reward allocation
- Withdraw LP tokens anytime
- Claim FRT rewards without withdrawing
- Pending rewards update every 15 seconds

### Auto Compound Vault
- Deposit STK tokens into the auto-compound vault
- Earn STK rewards automatically
- Compound button restakes all pending rewards instantly
- Receipt token (vSTK) minted on deposit and burned on withdrawal
- Price per share grows over time from compounding

## Smart Contract Addresses (Sepolia Testnet)

| Contract | Address |
|---|---|
| RewardToken (FRT) | 0x963cDEAc9D4D015c8345Ed47C0Ab674143cfbc41 |
| MasterChef | 0x25678BDdAEF50a55687a0639521b524a0F6Ad6db |
| LP Token 1 (LP1) | 0x5503A6D9b09EbC8F5206F476C42bf47b56Eb939D |
| LP Token 2 (LP2) | 0xB2C629D768C8718E83658a5496AC6b318034dbE7 |
| LP Token 3 (LP3) | 0x3b88Cd849E8768F3eBB1519A0c94011368e9A66C |
| StakingToken (STK) | 0x7A9cc9631BE5cd11cA090aa6B47d1891d0376dC1 |
| StakingContract | 0x54B5d333F5Cca71dF60E2602153D5b36F35b39CE |
| VaultToken (vSTK) | 0xca6128C9A0D1c59cDB6c3a573D480D67c810D051 |
| AutoCompoundVault | 0x45a4FEdfbAf167c287F44A130F71b5603Fb92B19 |

## Tech Stack

### Smart Contracts
- Solidity 0.8.20
- Hardhat
- OpenZeppelin Contracts
- Ethereum Sepolia Testnet

### Frontend
- Next.js 14 (App Router)
- React
- Tailwind CSS
- RainbowKit
- Wagmi v2
- Ethers.js v6

## Getting Started

### Prerequisites
- Node.js v20+
- MetaMask wallet
- Sepolia testnet ETH

### Setup

1. Clone the repository
```bash
git clone https://github.com/Jansenc08/lp-farming-dapp.git
cd lp-farming-dapp
```

2. Install frontend dependencies
```bash
cd frontend
npm install --legacy-peer-deps
```

3. Create `.env.local` in the frontend folder
```
NEXT_PUBLIC_MASTERCHEF_ADDRESS=0x25678BDdAEF50a55687a0639521b524a0F6Ad6db
NEXT_PUBLIC_REWARD_TOKEN_ADDRESS=0x963cDEAc9D4D015c8345Ed47C0Ab674143cfbc41
NEXT_PUBLIC_LP1_ADDRESS=0x5503A6D9b09EbC8F5206F476C42bf47b56Eb939D
NEXT_PUBLIC_LP2_ADDRESS=0xB2C629D768C8718E83658a5496AC6b318034dbE7
NEXT_PUBLIC_LP3_ADDRESS=0x3b88Cd849E8768F3eBB1519A0c94011368e9A66C
NEXT_PUBLIC_STAKING_TOKEN_ADDRESS=0x7A9cc9631BE5cd11cA090aa6B47d1891d0376dC1
NEXT_PUBLIC_STAKING_CONTRACT_ADDRESS=0x54B5d333F5Cca71dF60E2602153D5b36F35b39CE
NEXT_PUBLIC_VAULT_TOKEN_ADDRESS=0xca6128C9A0D1c59cDB6c3a573D480D67c810D051
NEXT_PUBLIC_AUTO_COMPOUND_VAULT_ADDRESS=0x45a4FEdfbAf167c287F44A130F71b5603Fb92B19
NEXT_PUBLIC_CHAIN_ID=11155111
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id
```

4. Run the development server
```bash
npm run dev
```

5. Open http://localhost:3000

## How To Use

### Farm Page
1. Connect your MetaMask wallet on Sepolia network
2. Approve LP tokens for the MasterChef contract
3. Deposit LP tokens into any pool
4. Watch your FRT rewards accumulate
5. Claim or withdraw anytime

### Vault Page
1. Connect your MetaMask wallet on Sepolia network
2. Approve STK tokens for the vault
3. Deposit STK tokens
4. Receive vSTK receipt tokens
5. Click Compound Now to restake pending rewards
6. Withdraw anytime to receive STK plus compounded rewards

## Network

- **Network:** Ethereum Sepolia Testnet
- **Chain ID:** 11155111
