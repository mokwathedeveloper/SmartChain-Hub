const hre = require("hardhat");

async function main() {
  const network  = hre.network.name;
  const explorer = network === "og_newton"
    ? "https://scan-testnet.0g.ai/address"
    : "https://chainscan.0g.ai/address";

  console.log(`\nDeploying SmartChainAgentEscrow to: ${network}\n`);

  const Escrow = await hre.ethers.getContractFactory("SmartChainAgentEscrow");
  const escrow = await Escrow.deploy();
  await escrow.waitForDeployment();
  const addr = await escrow.getAddress();

  console.log(`SmartChainAgentEscrow: ${addr}`);
  console.log(`  → ${explorer}/${addr}`);
  console.log(`\nAdd to .env.local:\n  NEXT_PUBLIC_AGENT_ESCROW_CONTRACT=${addr}`);
}

main().catch((e) => { console.error(e); process.exitCode = 1; });
