const hre = require("hardhat");

// Deploy SmartChainAgentMarket to 0G Galileo Testnet:
//   npx hardhat run scripts/deploy-market.js --network og_galileo

const EXPLORERS = {
  og_galileo: "https://chainscan-galileo.0g.ai/address",
  og_mainnet:  "https://chainscan.0g.ai/address",
  og_newton:   "https://scan-testnet.0g.ai/address",
  ethereum:    "https://etherscan.io/address",
  sepolia:     "https://sepolia.etherscan.io/address",
};

async function main() {
  const network = hre.network.name;
  const explorer = EXPLORERS[network] || "";
  const [deployer] = await hre.ethers.getSigners();

  console.log(`\nNetwork:  ${network}`);
  console.log(`Deployer: ${deployer.address}`);
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log(`Balance:  ${hre.ethers.formatEther(balance)} A0GI\n`);

  const Market = await hre.ethers.getContractFactory("SmartChainAgentMarket");
  console.log("Deploying SmartChainAgentMarket...");
  const market = await Market.deploy();
  await market.waitForDeployment();
  const addr = await market.getAddress();

  console.log(`\nSmartChainAgentMarket: ${addr}`);
  if (explorer) console.log(`  → ${explorer}/${addr}`);

  console.log(`\nSet in Vercel / .env.local:`);
  console.log(`  NEXT_PUBLIC_AGENT_MARKET_CONTRACT=${addr}`);
}

main().catch((e) => { console.error(e); process.exitCode = 1; });
