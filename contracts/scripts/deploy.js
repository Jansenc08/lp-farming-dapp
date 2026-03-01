const hre = require("hardhat");

const REWARD_PER_BLOCK = hre.ethers.parseEther("200");
const TEST_ADDRESS = "0x34846BF00C64A56A5FB10a9EE7717aBC7887FEdf";
const LP_SEND_AMOUNT = hre.ethers.parseEther("1000");

const LP_TOKENS = [
  { name: "LP Token 1", symbol: "LP1" },
  { name: "LP Token 2", symbol: "LP2" },
  { name: "LP Token 3", symbol: "LP3" },
];
const ALLOC_POINTS = [50, 30, 20];

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying with account:", deployer.address);

  // 1. Deploy RewardToken
  const RewardToken = await hre.ethers.getContractFactory("RewardToken");
  const rewardToken = await RewardToken.deploy();
  await rewardToken.waitForDeployment();
  const rewardTokenAddress = await rewardToken.getAddress();
  console.log("RewardToken deployed to:", rewardTokenAddress);

  // 2. Start block: use current block + 1 so rewards start from next block (or use current for immediate)
  const startBlock = await hre.ethers.provider.getBlockNumber();

  // 3. Deploy MasterChef
  const MasterChef = await hre.ethers.getContractFactory("MasterChef");
  const masterChef = await MasterChef.deploy(rewardTokenAddress, REWARD_PER_BLOCK, startBlock);
  await masterChef.waitForDeployment();
  const masterChefAddress = await masterChef.getAddress();
  console.log("MasterChef deployed to:", masterChefAddress);

  // 4. Transfer RewardToken ownership to MasterChef
  await rewardToken.transferOwnership(masterChefAddress);
  console.log("RewardToken ownership transferred to MasterChef");

  // 5. Deploy 3 MockLPTokens
  const lpAddresses = [];
  for (const { name, symbol } of LP_TOKENS) {
    const MockLP = await hre.ethers.getContractFactory("MockLPToken");
    const lp = await MockLP.deploy(name, symbol);
    await lp.waitForDeployment();
    const addr = await lp.getAddress();
    lpAddresses.push(addr);
    console.log(`${symbol} deployed to:`, addr);
  }

  // 6. Add 3 pools with allocation points 50, 30, 20
  for (let i = 0; i < lpAddresses.length; i++) {
    const lp = await hre.ethers.getContractAt("MockLPToken", lpAddresses[i]);
    await masterChef.add(ALLOC_POINTS[i], lp);
    console.log(`Pool ${i} added (allocPoint=${ALLOC_POINTS[i]})`);
  }

  // 7. Send 1000 of each LP token to test address
  for (let i = 0; i < lpAddresses.length; i++) {
    const lp = await hre.ethers.getContractAt("MockLPToken", lpAddresses[i]);
    await lp.transfer(TEST_ADDRESS, LP_SEND_AMOUNT);
    console.log(`Sent 1000 ${LP_TOKENS[i].symbol} to ${TEST_ADDRESS}`);
  }

  // --- Print all contract addresses ---
  console.log("\n========== DEPLOYMENT SUMMARY ==========");
  console.log("RewardToken (FRT):     ", rewardTokenAddress);
  console.log("MasterChef:            ", masterChefAddress);
  console.log("LP Token 1 (LP1):      ", lpAddresses[0]);
  console.log("LP Token 2 (LP2):      ", lpAddresses[1]);
  console.log("LP Token 3 (LP3):      ", lpAddresses[2]);
  console.log("Test address received 1000 of each LP:", TEST_ADDRESS);
  console.log("=========================================\n");

  // 8. Verify on Etherscan (wait for indexer)
  if (hre.network.config.chainId === 11155111) {
    console.log("Waiting for block confirmations before verification...");
    await new Promise((r) => setTimeout(r, 45_000));

    const verify = async (address, constructorArguments, contractPath) => {
      try {
        await hre.run("verify:verify", {
          address,
          constructorArguments,
          contract: contractPath,
        });
        console.log("Verified:", address);
      } catch (e) {
        if (e.message && e.message.includes("Already Verified")) {
          console.log("Already verified:", address);
        } else {
          console.error("Verify failed for", address, e.message);
        }
      }
    };

    await verify(rewardTokenAddress, [], "contracts/RewardToken.sol:RewardToken");
    await verify(masterChefAddress, [rewardTokenAddress, REWARD_PER_BLOCK, startBlock], "contracts/MasterChef.sol:MasterChef");
    await verify(lpAddresses[0], [LP_TOKENS[0].name, LP_TOKENS[0].symbol], "contracts/MockLPToken.sol:MockLPToken");
    await verify(lpAddresses[1], [LP_TOKENS[1].name, LP_TOKENS[1].symbol], "contracts/MockLPToken.sol:MockLPToken");
    await verify(lpAddresses[2], [LP_TOKENS[2].name, LP_TOKENS[2].symbol], "contracts/MockLPToken.sol:MockLPToken");
  }
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
