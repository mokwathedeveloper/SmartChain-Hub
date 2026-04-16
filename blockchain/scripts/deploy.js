const hre = require("hardhat");

async function main() {
  console.log("Deploying SmartChain Hub contracts to 0G Newton Testnet...");

  // 1. Deploy SmartChainTransaction
  const SmartChainTransaction = await hre.ethers.getContractFactory("SmartChainTransaction");
  const transaction = await SmartChainTransaction.deploy();
  await transaction.waitForDeployment();
  console.log(`SmartChainTransaction deployed to: ${await transaction.getAddress()}`);

  // 2. Deploy SmartChainRevenue
  const SmartChainRevenue = await hre.ethers.getContractFactory("SmartChainRevenue");
  const revenue = await SmartChainRevenue.deploy();
  await revenue.waitForDeployment();
  console.log(`SmartChainRevenue deployed to: ${await revenue.getAddress()}`);

  console.log("\nDeployment complete! Update your frontend .env.local with these addresses.");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
