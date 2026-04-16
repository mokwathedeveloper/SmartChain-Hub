const { ethers } = require('ethers');
require('dotenv').config();

const OG_MAINNET_RPC = 'https://evmrpc.0g.ai';
const TX_ABI = [
  'function recordTransaction(bytes32 txHash, uint256 amount, uint256 fee, string route) external',
  'function getTransaction(bytes32 txHash) external view returns (tuple(address sender, uint256 amount, uint256 fee, string route, bool validated, uint256 timestamp))',
  'event TransactionRecorded(bytes32 indexed txHash, address indexed sender, uint256 amount)',
];

async function main() {
  const provider = new ethers.JsonRpcProvider(OG_MAINNET_RPC, 16661);
  const signer = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
  const contract = new ethers.Contract(process.env.CONTRACT_ADDRESS, TX_ABI, signer);

  // Example: record a test transaction
  const hash = ethers.id(`test-${Date.now()}`);
  console.log('Recording test transaction...');
  const tx = await contract.recordTransaction(hash, ethers.parseUnits('100', 18), ethers.parseUnits('0.5', 18), '0G Chain Flash Route');
  await tx.wait();
  console.log(`Transaction recorded: ${tx.hash}`);
  console.log(`View on ChainScan: https://chainscan.0g.ai/tx/${tx.hash}`);

  // Read it back
  const stored = await contract.getTransaction(hash);
  console.log('Stored transaction:', stored);
}

main().catch(console.error);
