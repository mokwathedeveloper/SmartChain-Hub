import { ethers } from 'ethers';
import { ACTIVE_CHAIN } from './chains';

const TX_ABI = [
  'function recordTransaction(bytes32 _txHash, uint256 _amount, uint256 _fee, uint256 _savings, string calldata _route, bytes32 _storageRoot) external',
  'function validateTransaction(bytes32 _txHash) external',
  'function getTransaction(bytes32 txHash) external view returns (tuple(address sender, uint256 amount, uint256 fee, uint256 savings, string route, bytes32 storageRoot, bool validated, uint256 timestamp))',
  'function getStats() external view returns (uint256 total, uint256 savings)',
  'event TransactionRecorded(bytes32 indexed txHash, address indexed sender, uint256 amount, uint256 savings, bytes32 storageRoot)',
  'event TransactionValidated(bytes32 indexed txHash, address indexed sender)',
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

export async function recordTransactionOnChain(
  signer: ethers.Signer,
  amount: number,
  fee: number,
  route: string,
  savings: number = 0,
  storageRootHex: string = ethers.ZeroHash,
): Promise<string> {
  const contract = getContract(signer);
  const txHash = ethers.id(`${Date.now()}-${amount}-${route}`);
  const storageRoot = storageRootHex.startsWith('0x') && storageRootHex.length === 66
    ? storageRootHex as `0x${string}`
    : ethers.ZeroHash;
  const tx = await contract.recordTransaction(
    txHash,
    ethers.parseUnits(amount.toString(), 18),
    ethers.parseUnits(fee.toString(), 18),
    ethers.parseUnits(savings.toString(), 18),
    route,
    storageRoot,
  );
  await tx.wait();
  return tx.hash;
}

export async function getOnChainStats(provider?: ethers.Provider): Promise<{ total: number; savingsWei: bigint }> {
  const p = provider ?? getProvider();
  const contract = getContract(p);
  const [total, savingsWei] = await contract.getStats();
  return { total: Number(total), savingsWei };
}

export function getExplorerUrl(txHash: string): string {
  return ACTIVE_CHAIN.explorerTx(txHash);
}

export function shortenAddress(address: string): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}
