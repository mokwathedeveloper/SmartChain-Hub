const hre = require("hardhat");

const EXPLORERS = {
  og_mainnet: "https://chainscan.0g.ai/address",
  og_newton:  "https://scan-testnet.0g.ai/address",
};

async function main() {
  const network = hre.network.name;
  const explorer = EXPLORERS[network] || "";
  console.log(`\nDeploying SmartChainAgentID to: ${network}\n`);

  const AID = await hre.ethers.getContractFactory("SmartChainAgentID");
  const aid = await AID.deploy();
  await aid.waitForDeployment();
  const aidAddr = await aid.getAddress();
  console.log(`SmartChainAgentID: ${aidAddr}`);
  if (explorer) console.log(`  → ${explorer}/${aidAddr}`);
  console.log(`\nAdd to .env.local:\n  NEXT_PUBLIC_AGENT_ID_CONTRACT=${aidAddr}`);
}

main().catch((e) => { console.error(e); process.exitCode = 1; });
