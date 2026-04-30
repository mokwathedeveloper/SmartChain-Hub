/**
 * Agent ID — on-chain soulbound identity for the SmartChain AI agent.
 * Contract: SmartChainAgentID on 0G Galileo Testnet
 * Docs: https://docs.0g.ai/build-with-0g/agent-id
 */
import { ethers } from "ethers";

const AGENT_ID_ABI = [
  "function mintAgentID(bytes32 modelHash) external",
  "function updateMemory(bytes32 newMemoryRoot, uint256 savingsWei) external",
  "function getAgent(address owner) external view returns (tuple(address owner, bytes32 memoryRoot, bytes32 modelHash, uint256 reputation, uint256 totalSavings, uint256 mintedAt, bool exists))",
  "function hasMinted(address) external view returns (bool)",
  "function totalAgents() external view returns (uint256)",
  "function resetMint(address wallet) external",
  "event AgentMinted(address indexed owner, bytes32 modelHash, uint256 timestamp)",
  "event MemoryUpdated(address indexed owner, bytes32 newMemoryRoot, uint256 reputation)",
];

// Deterministic hash of the TF model — proves which model version the agent uses
export const MODEL_HASH = ethers.keccak256(
  ethers.toUtf8Bytes("SmartChain-TF-SavingsModel-v2.16-6feature")
);

const OG_NETWORK = ethers.Network.from({ chainId: 16602, name: 'og-galileo' });
const OG_RPC     = 'https://evmrpc-testnet.0g.ai';

/** Read-only provider — static network skips detection, avoids timeout on 0G Galileo */
function getReadProvider() {
  return new ethers.JsonRpcProvider(OG_RPC, OG_NETWORK, { staticNetwork: OG_NETWORK });
}

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_AGENT_ID_CONTRACT || '0x0Dd3Ac67C684630273d5369a5DBaC174EB44c911';

function getContract(signer: ethers.Signer) {
  return new ethers.Contract(ethers.getAddress(CONTRACT_ADDRESS), AGENT_ID_ABI, signer);
}

function getReadContract() {
  return new ethers.Contract(ethers.getAddress(CONTRACT_ADDRESS), AGENT_ID_ABI, getReadProvider());
}

/** Check if user already has an Agent ID minted. */
export async function hasAgentID(signer: ethers.Signer): Promise<boolean> {
  const addr = ethers.getAddress(await signer.getAddress());
  return getReadContract().hasMinted(addr);
}

/** Mint a soulbound Agent ID for the user. One per wallet. */
export async function mintAgentID(signer: ethers.Signer): Promise<string> {
  const tx = await getContract(signer).mintAgentID(MODEL_HASH);
  const receipt = await tx.wait();
  return receipt.hash;
}

/** Update agent memory root on-chain after a 0G Storage KV write. */
export async function updateAgentMemory(
  signer: ethers.Signer,
  memoryRootHex: string,
  savingsUsd: number
): Promise<string> {
  const savingsWei = BigInt(Math.round(savingsUsd * 1e15));
  const memoryRoot = memoryRootHex.startsWith("0x")
    ? memoryRootHex.padEnd(66, "0").slice(0, 66)
    : `0x${memoryRootHex.padEnd(64, "0").slice(0, 64)}`;
  const tx = await getContract(signer).updateMemory(memoryRoot, savingsWei);
  const receipt = await tx.wait();
  return receipt.hash;
}

/** Owner-only: reset mint status so wallet can mint again. */
export async function resetMint(signer: ethers.Signer, wallet: string): Promise<void> {
  const tx = await getContract(signer).resetMint(ethers.getAddress(wallet));
  await tx.wait();
}

/** Fetch the agent's full on-chain identity. */
export async function getAgentIdentity(signer: ethers.Signer) {
  const addr = ethers.getAddress(await signer.getAddress());
  const agent = await getReadContract().getAgent(addr);
  return {
    exists:       agent.exists,
    memoryRoot:   agent.memoryRoot,
    modelHash:    agent.modelHash,
    reputation:   Number(agent.reputation),
    totalSavings: Number(agent.totalSavings),
    mintedAt:     Number(agent.mintedAt) * 1000,
    explorerUrl:  `https://scan-testnet.0g.ai/address/${process.env.NEXT_PUBLIC_AGENT_ID_CONTRACT}`,
  };
}
