/**
 * agentMarket.ts — SmartChainAgentMarket contract client
 * Targets the chain set by NEXT_PUBLIC_CHAIN (defaults to og_mainnet).
 */
import { ethers } from "ethers";
import { ACTIVE_CHAIN } from "./chains";

// specialty and modelHash are bytes32 on-chain (gas-optimised).
// Use ethers.encodeBytes32String / decodeBytes32String for conversion.
const MARKET_ABI = [
  "function listAgent(uint256 pricePerTask, bytes32 specialty, bytes32 modelHash) external",
  "function delistAgent() external",
  "function hireAgent(address agentOwner, string calldata taskRef) external payable",
  "function getActiveListings() external view returns (tuple(address owner, uint256 pricePerTask, bytes32 specialty, bytes32 modelHash, uint256 totalHires, uint256 totalEarned, bool active, uint256 listedAt)[])",
  "function getListing(address owner) external view returns (tuple(address owner, uint256 pricePerTask, bytes32 specialty, bytes32 modelHash, uint256 totalHires, uint256 totalEarned, bool active, uint256 listedAt))",
  "function getMarketStats() external view returns (uint256 listed, uint256 hiresTotal, uint256 volumeWei)",
  "event AgentListed(address indexed owner, uint256 pricePerTask, bytes32 specialty)",
  "event AgentHired(uint256 indexed hireId, address indexed hirer, address indexed agentOwner, uint256 paidWei, string taskRef)",
];

export interface AgentListing {
  owner:        string;
  pricePerTask: bigint;
  specialty:    string;
  modelHash:    string;
  totalHires:   number;
  totalEarned:  bigint;
  active:       boolean;
  listedAt:     number;
}

const OG_NETWORK = ethers.Network.from({ chainId: ACTIVE_CHAIN.chainId, name: ACTIVE_CHAIN.name });
const OG_RPC     = ACTIVE_CHAIN.rpc;

const MARKET_ADDRESS = process.env.NEXT_PUBLIC_AGENT_MARKET_CONTRACT || "";

function getReadProvider() {
  return new ethers.JsonRpcProvider(OG_RPC, OG_NETWORK, { staticNetwork: OG_NETWORK });
}

function getReadContract() {
  if (!MARKET_ADDRESS) throw new Error("NEXT_PUBLIC_AGENT_MARKET_CONTRACT not set");
  return new ethers.Contract(MARKET_ADDRESS, MARKET_ABI, getReadProvider());
}

function getWriteContract(signer: ethers.Signer) {
  if (!MARKET_ADDRESS) throw new Error("NEXT_PUBLIC_AGENT_MARKET_CONTRACT not set");
  return new ethers.Contract(MARKET_ADDRESS, MARKET_ABI, signer);
}

/** Encode a UTF-8 string to bytes32 (byte-aware truncation — max 31 UTF-8 bytes). */
function toBytes32(s: string): string {
  const enc = new TextEncoder();
  let safe = '';
  let byteLen = 0;
  for (const ch of s) {
    const chBytes = enc.encode(ch).length;
    if (byteLen + chBytes > 31) break;
    safe += ch;
    byteLen += chBytes;
  }
  return ethers.encodeBytes32String(safe);
}

/** Decode bytes32 back to a human-readable string. */
function fromBytes32(b: string): string {
  try { return ethers.decodeBytes32String(b); } catch { return b; }
}

/** List your agent for hire. priceUsd is converted to wei (1 USD = 1e15 wei on testnet). */
export async function listAgentForHire(
  signer: ethers.Signer,
  priceUsd: number,
  specialty: string,
  modelHash: string,
): Promise<string> {
  if (!Number.isFinite(priceUsd) || priceUsd <= 0) throw new Error("Invalid priceUsd: must be a positive finite number");
  if (!specialty.trim())  throw new Error("specialty is required");
  if (!modelHash.trim())  throw new Error("modelHash is required");
  const priceWei = BigInt(Math.round(priceUsd * 1e15));
  const tx = await getWriteContract(signer).listAgent(priceWei, toBytes32(specialty), toBytes32(modelHash));
  const receipt = await tx.wait();
  return receipt.hash;
}

/** Remove your listing from the marketplace. */
export async function delistAgent(signer: ethers.Signer): Promise<string> {
  const tx = await getWriteContract(signer).delistAgent();
  const receipt = await tx.wait();
  return receipt.hash;
}

/** Hire an agent — pay pricePerTask wei, attach taskRef for provenance. */
export async function hireAgent(
  signer: ethers.Signer,
  agentOwner: string,
  priceWei: bigint,
  taskRef: string,
): Promise<string> {
  const tx = await getWriteContract(signer).hireAgent(agentOwner, taskRef, { value: priceWei });
  const receipt = await tx.wait();
  return receipt.hash;
}

/** Fetch all active listings. Falls back to empty array if contract not deployed. */
export async function getActiveListings(): Promise<AgentListing[]> {
  try {
    const raw = await getReadContract().getActiveListings() as AgentListing[];
    return raw.map(r => ({
      owner:        r.owner,
      pricePerTask: BigInt(r.pricePerTask.toString()),
      specialty:    fromBytes32(r.specialty as unknown as string),
      modelHash:    fromBytes32(r.modelHash as unknown as string),
      totalHires:   Number(r.totalHires),
      totalEarned:  BigInt(r.totalEarned.toString()),
      active:       r.active,
      listedAt:     Number(r.listedAt) * 1000,
    }));
  } catch {
    return [];
  }
}

/** Get market stats. */
export async function getMarketStats(): Promise<{ listed: number; hiresTotal: number; volumeWei: bigint }> {
  try {
    const [listed, hiresTotal, volumeWei] = await getReadContract().getMarketStats();
    return { listed: Number(listed), hiresTotal: Number(hiresTotal), volumeWei: BigInt(volumeWei.toString()) };
  } catch {
    return { listed: 0, hiresTotal: 0, volumeWei: BigInt(0) };
  }
}

/** Get a single listing. */
export async function getMyListing(owner: string): Promise<AgentListing | null> {
  try {
    const r = await getReadContract().getListing(owner);
    if (!r.active) return null;
    return {
      owner:        r.owner,
      pricePerTask: BigInt(r.pricePerTask.toString()),
      specialty:    fromBytes32(r.specialty as unknown as string),
      modelHash:    fromBytes32(r.modelHash as unknown as string),
      totalHires:   Number(r.totalHires),
      totalEarned:  BigInt(r.totalEarned.toString()),
      active:       r.active,
      listedAt:     Number(r.listedAt) * 1000,
    };
  } catch {
    return null;
  }
}
