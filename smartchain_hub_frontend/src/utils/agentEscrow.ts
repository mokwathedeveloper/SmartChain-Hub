/**
 * Agent Escrow — frontend utility for SmartChainAgentEscrow contract.
 * Handles deposit, payPerCall, withdraw, and channel reads.
 */
import { ethers } from "ethers";

const ESCROW_ABI = [
  "function deposit(address _agentB, uint256 _pricePerCall) external payable",
  "function payPerCall(address _agentA) external",
  "function withdraw(address _agentB) external",
  "function channelId(address _agentA, address _agentB) external pure returns (bytes32)",
  "function getChannel(address _agentA, address _agentB) external view returns (tuple(address agentA, address agentB, uint256 balance, uint256 pricePerCall, uint256 totalCalls, uint256 totalPaid, bool active))",
  "function getAgentChannelCount(address _agent) external view returns (uint256)",
  "event ChannelOpened(bytes32 indexed channelId, address indexed agentA, address indexed agentB, uint256 pricePerCall)",
  "event CallSettled(bytes32 indexed channelId, address indexed agentB, uint256 amount, uint256 callCount)",
];

function getEscrowAddress(): string {
  const addr = process.env.NEXT_PUBLIC_AGENT_ESCROW_CONTRACT || '0x0A3951414c4097AF78953a97e49ad38293e9eA17';
  return ethers.getAddress(addr); // checksummed
}

function getContract(signerOrProvider: ethers.Signer | ethers.Provider) {
  return new ethers.Contract(getEscrowAddress(), ESCROW_ABI, signerOrProvider);
}

/** Open or top-up a payment channel from agentA → agentB. */
export async function depositToChannel(
  signer:       ethers.Signer,
  agentB:       string,
  pricePerCall: string,   // in A0GI (e.g. "0.001")
  depositAmount: string   // in A0GI (e.g. "0.1")
): Promise<string> {
  const contract = getContract(signer);
  const tx = await contract.deposit(
    agentB,
    ethers.parseEther(pricePerCall),
    { value: ethers.parseEther(depositAmount) }
  );
  await tx.wait();
  return tx.hash;
}

/** Agent B claims payment for one API call rendered to agentA. */
export async function settleCall(signer: ethers.Signer, agentA: string): Promise<string> {
  const contract = getContract(signer);
  const tx = await contract.payPerCall(agentA);
  await tx.wait();
  return tx.hash;
}

/** Agent A withdraws remaining balance from a channel. */
export async function withdrawFromChannel(signer: ethers.Signer, agentB: string): Promise<string> {
  const contract = getContract(signer);
  const tx = await contract.withdraw(agentB);
  await tx.wait();
  return tx.hash;
}

/** Read channel state between two agents. */
export async function getChannelState(
  provider: ethers.Provider,
  agentA:   string,
  agentB:   string
) {
  const contract = getContract(provider);
  const ch = await contract.getChannel(agentA, agentB);
  return {
    agentA:       ch.agentA,
    agentB:       ch.agentB,
    balance:      ethers.formatEther(ch.balance),
    pricePerCall: ethers.formatEther(ch.pricePerCall),
    totalCalls:   Number(ch.totalCalls),
    totalPaid:    ethers.formatEther(ch.totalPaid),
    active:       ch.active,
  };
}
