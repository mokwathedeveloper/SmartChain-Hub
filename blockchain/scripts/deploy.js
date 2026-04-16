const hre = require("hardhat");

// Deploy to 0G Mainnet (hackathon):  npx hardhat run scripts/deploy.js --network og_mainnet
// Deploy to 0G Testnet:              npx hardhat run scripts/deploy.js --network og_newton
// Deploy to Ethereum Mainnet:        npx hardhat run scripts/deploy.js --network ethereum
// Deploy to Sepolia Testnet:         npx hardhat run scripts/deploy.js --network sepolia

const EXPLORERS = {
  og_mainnet: "https://chainscan.0g.ai/address",
  og_newton:  "https://scan-testnet.0g.ai/address",
  ethereum:   "https://etherscan.io/address",
  sepolia:    "https://sepolia.etherscan.io/address",
};

async function main() {
  const network = hre.network.name;
  const explorer = EXPLORERS[network] || "";
  console.log(`\nDeploying to: ${network}\n`);

  const Tx = await hre.ethers.getContractFactory("SmartChainTransaction");
  const tx = await Tx.deploy();
  await tx.waitForDeployment();
  const txAddr = await tx.getAddress();
  console.log(`SmartChainTransaction: ${txAddr}`);
  if (explorer) console.log(`  → ${explorer}/${txAddr}`);

  const Rev = await hre.ethers.getContractFactory("SmartChainRevenue");
  const rev = await Rev.deploy();
  await rev.waitForDeployment();
  const revAddr = await rev.getAddress();
  console.log(`SmartChainRevenue:     ${revAddr}`);
  if (explorer) console.log(`  → ${explorer}/${revAddr}`);

  console.log(`\nUpdate .env.local:\n  NEXT_PUBLIC_CONTRACT_ADDRESS=${txAddr}\n  NEXT_PUBLIC_CHAIN=${network}`);
}

main().catch((e) => { console.error(e); process.exitCode = 1; });
