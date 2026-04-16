import { ethers } from 'ethers';
import { ACTIVE_CHAIN } from './chains';

const TX_ABI = [
  'function recordTransaction(bytes32 txHash, uint256 amount, uint256 fee, string route) external',
  'function getTransaction(bytes32 txHash) external view returns (tuple(address sender, uint256 amount, uint256 fee, string route, bool validated, uint256 timestamp))',
  'event TransactionRecorded(bytes32 indexed txHash, address indexed sender, uint256 amount)',
];

export function getProvider() {
  return new ethers.JsonRpcProvider(ACTIVE_CHAIN.rpc, ACTIVE_CHAIN.chainId);
}

export function getContract(signerOrProvider: ethers.Signer | ethers.Provider) {
  const address = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;
  if (!address || address === 'your-deployed-contract-address-here') {
    throw new Error('Contract address not configured in .env.local');
  }
  return new ethers.Contract(address, TX_ABI, signerOrProvider);
}

export async function recordTransactionOnChain(signer: ethers.Signer, amount: number, fee: number, route: string): Promise<string> {
  const contract = getContract(signer);
  const txHash = ethers.id(`${Date.now()}-${amount}-${route}`);
  const tx = await contract.recordTransaction(txHash, ethers.parseUnits(amount.toString(), 18), ethers.parseUnits(fee.toString(), 18), route);
  await tx.wait();
  return tx.hash;
}

export function getExplorerUrl(txHash: string): string {
  return ACTIVE_CHAIN.explorerTx(txHash);
}

export function shortenAddress(address: string): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}
