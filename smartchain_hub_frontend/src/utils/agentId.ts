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
  "event AgentMinted(address indexed owner, bytes32 modelHash, uint256 timestamp)",
  "event MemoryUpdated(address indexed owner, bytes32 newMemoryRoot, uint256 reputation)",
];

// Deterministic hash of the TF model — proves which model version the agent uses
export const MODEL_HASH = ethers.keccak256(
  ethers.toUtf8Bytes("SmartChain-TF-SavingsModel-v2.16-6feature")
);

function getContract(signer: ethers.Signer) {
  const addr = process.env.NEXT_PUBLIC_AGENT_ID_CONTRACT;
  if (!addr) throw new Error("NEXT_PUBLIC_AGENT_ID_CONTRACT not set");
  return new ethers.Contract(addr, AGENT_ID_ABI, signer);
}

/** Check if user already has an Agent ID minted. */
export async function hasAgentID(signer: ethers.Signer): Promise<boolean> {
  const addr = await signer.getAddress();
  return getContract(signer).hasMinted(addr);
}

/** Mint a soulbound Agent ID for the user. One per wallet. */
export async function mintAgentID(signer: ethers.Signer): Promise<string> {
  const contract = getContract(signer);
  const tx = await contract.mintAgentID(MODEL_HASH);
  const receipt = await tx.wait();
  return receipt.hash;
}

/** Update agent memory root on-chain after a 0G Storage KV write. */
export async function updateAgentMemory(
  signer: ethers.Signer,
  memoryRootHex: string,
  savingsUsd: number
): Promise<string> {
  const contract = getContract(signer);
  // Convert USD savings to wei-equivalent (1 USD = 1e15 for display purposes)
  const savingsWei = BigInt(Math.round(savingsUsd * 1e15));
  const memoryRoot = memoryRootHex.startsWith("0x")
    ? memoryRootHex.padEnd(66, "0").slice(0, 66)
    : `0x${memoryRootHex.padEnd(64, "0").slice(0, 64)}`;
  const tx = await contract.updateMemory(memoryRoot, savingsWei);
  const receipt = await tx.wait();
  return receipt.hash;
}

/** Fetch the agent's full on-chain identity. */
export async function getAgentIdentity(signer: ethers.Signer) {
  const addr = await signer.getAddress();
  const agent = await getContract(signer).getAgent(addr);
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
