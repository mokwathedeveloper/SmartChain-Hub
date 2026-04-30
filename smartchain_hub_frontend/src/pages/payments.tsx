import Head from "next/head";
import React, { useState, useEffect, useRef } from "react";
import { useWeb3 } from "@/context/Web3Context";
import { useNotification } from "@/context/NotificationContext";
import { ethers } from "ethers";
import { depositToChannel, settleCall, withdrawFromChannel, getChannelState } from "@/utils/agentEscrow";

const OG_RPC = "https://evmrpc-testnet.0g.ai";
const OG_NETWORK = ethers.Network.from({ chainId: 16602, name: 'og-galileo' });
// Module-level static-network provider — created once, skips network detection, never causes re-render
const RPC_PROVIDER = typeof window !== "undefined"
  ? new ethers.JsonRpcProvider(OG_RPC, OG_NETWORK, { staticNetwork: OG_NETWORK })
  : null;

const PAYMENTS_ABI = [
  "function sendFunds(address payable _to, string _memo) external payable",
  "function stake() external payable",
  "function unstake() external",
  "function claimEarnings() external",
  "function getStake(address user) external view returns (uint256 amount, uint256 reward)",
  "function pendingEarnings(address) external view returns (uint256)",
  "event FundsSent(address indexed from, address indexed to, uint256 amount, uint256 fee, string memo)",
  "event Staked(address indexed user, uint256 amount)",
  "event Unstaked(address indexed user, uint256 amount, uint256 reward)",
];

export default function Payments() {
  const { signer, isConnected, address, connectWallet } = useWeb3();
  const { addNotification } = useNotification();
  const [tab, setTab] = useState("Send");
  const [loading, setLoading] = useState(false);
  const [manualAddress, setManualAddress] = useState("");
  const [useManual, setUseManual] = useState(false);

  const displayAddress = address || manualAddress;
  const isWalletConnected = isConnected || (manualAddress && manualAddress.length > 0);
  
  const handleManualConnect = () => {
    if (!manualAddress.trim()) return;
    if (!/^0x[a-fA-F0-9]{40}$/.test(manualAddress.trim())) return;
    setUseManual(true);
  };

  // Send
  const [sendTo, setSendTo] = useState("");
  const [sendAmt, setSendAmt] = useState("");
  const [sendMemo, setSendMemo] = useState("");

  // Stake
  const [stakeAmt, setStakeAmt] = useState("");
  const [staked, setStaked] = useState({ amount: "0", reward: "0" });
  const [earnings, setEarnings] = useState("0");

  // Agent Escrow
  const [escrowAgentB, setEscrowAgentB] = useState("");
  const [escrowPrice, setEscrowPrice] = useState("");
  const [escrowDeposit, setEscrowDeposit] = useState("");
  const [escrowAgentA, setEscrowAgentA] = useState("");
  const [escrowChannel, setEscrowChannel] = useState<any>(null);
  const [escrowLoading, setEscrowLoading] = useState(false);

  const PAYMENTS_ADDR = (process.env.NEXT_PUBLIC_PAYMENTS_CONTRACT || '').trim();

  // Read-only — uses module-level RPC provider, never causes re-render
  const getReadContract = () => {
    if (!PAYMENTS_ADDR || !RPC_PROVIDER) throw new Error("Provider not available");
    return new ethers.Contract(PAYMENTS_ADDR, PAYMENTS_ABI, RPC_PROVIDER);
  };

  // Write — requires MetaMask signer
  const getWriteContract = () => {
    if (!PAYMENTS_ADDR) throw new Error("NEXT_PUBLIC_PAYMENTS_CONTRACT not set");
    if (!signer) throw new Error("Wallet not connected — please connect MetaMask");
    return new ethers.Contract(PAYMENTS_ADDR, PAYMENTS_ABI, signer);
  };

  const fetchStakeData = async () => {
    if (!displayAddress || !PAYMENTS_ADDR) return;
    try {
      const c = getReadContract();
      const [amt, rew] = await c.getStake(displayAddress);
      setStaked({ amount: ethers.formatEther(amt), reward: ethers.formatEther(rew) });
      const earn = await c.pendingEarnings(displayAddress);
      setEarnings(ethers.formatEther(earn));
    } catch {
      // contract not yet deployed or RPC unavailable — show zeros
    }
  };

  useEffect(() => { fetchStakeData(); }, [displayAddress, PAYMENTS_ADDR]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSend = async () => {
    if (!sendTo || !sendAmt) return;
    if (!signer) { addNotification('Connect MetaMask to send funds', 'error'); return; }
    setLoading(true);
    try {
      const c = getWriteContract();
      const tx = await c.sendFunds(sendTo, sendMemo || "Payment", { value: ethers.parseEther(sendAmt) });
      await tx.wait();
      addNotification(`Sent ${sendAmt} A0GI to ${sendTo}`, 'success');
      setSendTo(""); setSendAmt(""); setSendMemo("");
    } catch (e: any) {
      addNotification(`Send failed: ${e.reason || e.message}`, 'error');
    } finally { setLoading(false); }
  };

  const handleStake = async () => {
    if (!stakeAmt) return;
    if (!signer) { addNotification('Connect MetaMask to stake', 'error'); return; }
    setLoading(true);
    try {
      // Check wallet balance before staking
      const ethersProvider = signer.provider as ethers.Provider;
      const addr = await signer.getAddress();
      const balance = await ethersProvider.getBalance(addr);
      const stakeWei = ethers.parseEther(stakeAmt);
      const gasBuffer = ethers.parseEther("0.01"); // reserve for gas
      if (stakeWei + gasBuffer > balance) {
        addNotification(
          `Insufficient balance. You have ${parseFloat(ethers.formatEther(balance)).toFixed(4)} A0GI but need ${stakeAmt} A0GI + gas.`,
          'error'
        );
        return;
      }
      const c = getWriteContract();
      const tx = await c.stake({ value: stakeWei });
      await tx.wait();
      addNotification(`Staked ${stakeAmt} A0GI successfully`, 'success');
      setStakeAmt(""); fetchStakeData();
    } catch (e: any) {
      addNotification(`Stake failed: ${e.reason || e.message}`, 'error');
    } finally { setLoading(false); }
  };

  const handleUnstake = async () => {
    if (!signer) { addNotification('Connect MetaMask to unstake', 'error'); return; }
    setLoading(true);
    try {
      const c = getWriteContract();
      const tx = await c.unstake();
      await tx.wait();
      addNotification(`Unstaked ${staked.amount} A0GI + ${staked.reward} reward`, 'success');
      fetchStakeData();
    } catch (e: any) {
      addNotification(`Unstake failed: ${e.reason || e.message}`, 'error');
    } finally { setLoading(false); }
  };

  const handleClaimEarnings = async () => {
    if (!signer) { addNotification('Connect MetaMask to claim', 'error'); return; }
    setLoading(true);
    try {
      const c = getWriteContract();
      const tx = await c.claimEarnings();
      await tx.wait();
      addNotification(`Claimed ${earnings} A0GI`, 'success');
      fetchStakeData();
    } catch (e: any) {
      addNotification(`Claim failed: ${e.reason || e.message}`, 'error');
    } finally { setLoading(false); }
  };

  const handleEscrowDeposit = async () => {
    if (!escrowAgentB || !escrowPrice || !escrowDeposit || !signer) return;
    setEscrowLoading(true);
    try {
      const txHash = await depositToChannel(signer, escrowAgentB, escrowPrice, escrowDeposit);
      addNotification(`Channel opened. Tx: ${txHash.slice(0, 16)}...`, 'success');
      setEscrowAgentB(""); setEscrowPrice(""); setEscrowDeposit("");
    } catch (e: any) {
      addNotification(`Escrow error: ${e.message}`, 'error');
    } finally { setEscrowLoading(false); }
  };

  const handleEscrowSettle = async () => {
    if (!escrowAgentA || !signer) return;
    setEscrowLoading(true);
    try {
      const txHash = await settleCall(signer, escrowAgentA);
      addNotification(`Call settled. Tx: ${txHash.slice(0, 16)}...`, 'success');
    } catch (e: any) {
      addNotification(`Settle error: ${e.message}`, 'error');
    } finally { setEscrowLoading(false); }
  };

  const handleEscrowWithdraw = async () => {
    if (!escrowAgentB || !signer) return;
    setEscrowLoading(true);
    try {
      const txHash = await withdrawFromChannel(signer, escrowAgentB);
      addNotification(`Withdrawn. Tx: ${txHash.slice(0, 16)}...`, 'success');
    } catch (e: any) {
      addNotification(`Withdraw error: ${e.message}`, 'error');
    } finally { setEscrowLoading(false); }
  };

  const handleEscrowCheck = async () => {
    if (!escrowAgentA || !escrowAgentB) return;
    setEscrowLoading(true);
    try {
      if (!RPC_PROVIDER) throw new Error('Provider not available');
      const ch = await getChannelState(RPC_PROVIDER, escrowAgentA, escrowAgentB);
      setEscrowChannel(ch);
    } catch (e: any) {
      addNotification(`Check error: ${e.message}`, 'error');
    } finally { setEscrowLoading(false); }
  };

  if (!isWalletConnected) {
    return (
      <>
        <Head><title>Payments | SmartChain Hub</title></Head>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-600/10 border border-blue-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/>
              </svg>
            </div>
            <h2 className="text-white font-bold text-lg mb-2">Connect your wallet</h2>
            <p className="text-gray-500 text-sm mb-4">Click Connect Wallet in the top right to get started.</p>
            
            {/* MetaMask Connection */}
            <button onClick={connectWallet}
              className="w-full max-w-sm mx-auto mb-4 flex items-center justify-center gap-3 px-6 py-3 bg-orange-600/10 border border-orange-600/30 text-orange-400 rounded-xl hover:bg-orange-600/20 transition-colors">
              <svg className="w-5 h-5" viewBox="0 0 40 40" fill="none">
                <path d="M35.5 4L22.5 13.5L25 8L35.5 4Z" fill="#E17726"/>
                <path d="M4.5 4L17.4 13.6L15 8L4.5 4Z" fill="#E27625"/>
              </svg>
              Connect with MetaMask
            </button>
            
            {/* Manual Address Input */}
            <div className="w-full max-w-sm mx-auto">
              <div className="flex items-center gap-2 mb-2">
                <div className="flex-1 h-px bg-gray-800"/>
                <span className="text-xs text-gray-600">or enter manually</span>
                <div className="flex-1 h-px bg-gray-800"/>
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={manualAddress}
                  onChange={e => setManualAddress(e.target.value)}
                  placeholder="0x604cDbDBE7850bAd105C28bFE01Ad680520D451F"
                  className="flex-1 px-3 py-2 bg-gray-950 border border-gray-700 rounded-lg text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 text-sm font-mono"
                />
                <button onClick={handleManualConnect}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg transition-colors text-sm">
                  Connect
                </button>
              </div>
            </div>
            
            <p className="text-gray-600 text-xs mt-4">Supports MetaMask and manual address entry</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Head><title>Payments | SmartChain Hub</title></Head>
      <div className="space-y-6">

        {/* Tabs */}
        <div className="flex gap-6 border-b border-gray-700">
          {["Send", "Receive", "Stake", "Withdraw", "Agent Escrow"].map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`pb-3 text-sm font-semibold transition-colors ${tab === t ? "text-blue-600 border-b-2 border-blue-600" : "text-gray-500 hover:text-gray-200"}`}>
              {t}
            </button>
          ))}
        </div>

        {/* Send */}
        {tab === "Send" && (
          <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800 max-w-lg">
            <h2 className="text-base font-bold text-white mb-5">Send A0GI</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-xs text-gray-500 mb-1.5">Recipient Address</label>
                <input type="text" value={sendTo} onChange={e => setSendTo(e.target.value)} placeholder="0x..."
                  className="w-full px-4 py-3 border border-gray-700 rounded-xl text-sm text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-900"/>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1.5">Amount (A0GI)</label>
                <input type="number" value={sendAmt} onChange={e => setSendAmt(e.target.value)} placeholder="0.0"
                  className="w-full px-4 py-3 border border-gray-700 rounded-xl text-sm text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-900"/>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1.5">Memo (optional)</label>
                <input type="text" value={sendMemo} onChange={e => setSendMemo(e.target.value)} placeholder="Payment for..."
                  className="w-full px-4 py-3 border border-gray-700 rounded-xl text-sm text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-900"/>
              </div>
              <p className="text-xs text-gray-500">Fee: 0.5% · Distributed to stakers</p>
              <button onClick={handleSend} disabled={loading || !sendTo || !sendAmt}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors disabled:opacity-50">
                {loading ? 'Sending...' : 'Send Funds'}
              </button>
            </div>
          </div>
        )}

        {/* Receive */}
        {tab === "Receive" && (
          <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800 max-w-lg">
            <h2 className="text-base font-bold text-white mb-5">Receive A0GI</h2>
            <p className="text-sm text-gray-500 mb-4">Share your address to receive payments:</p>
            <div className="p-4 bg-gray-900 rounded-xl border border-gray-700 font-mono text-sm text-gray-200 break-all">
              {displayAddress}
            </div>
            <button onClick={() => navigator.clipboard.writeText(displayAddress || '')}
              className="w-full mt-4 py-2.5 border border-gray-700 text-gray-500 font-medium rounded-xl hover:bg-gray-800 transition-colors">
              Copy Address
            </button>
          </div>
        )}

        {/* Stake */}
        {tab === "Stake" && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
                <p className="text-xs text-gray-500 mb-1">Your Stake</p>
                <span className="text-3xl font-bold text-white">{staked.amount} A0GI</span>
              </div>
              <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
                <p className="text-xs text-gray-500 mb-1">Pending Reward</p>
                <span className="text-3xl font-bold text-green-600">{staked.reward} A0GI</span>
              </div>
              <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
                <p className="text-xs text-gray-500 mb-1">APY</p>
                <span className="text-3xl font-bold text-white">5%</span>
              </div>
            </div>

            <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800 max-w-lg">
              <h2 className="text-base font-bold text-white mb-5">Stake A0GI</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs text-gray-500 mb-1.5">Amount to Stake</label>
                  <input type="number" value={stakeAmt} onChange={e => setStakeAmt(e.target.value)} placeholder="0.0"
                    className="w-full px-4 py-3 border border-gray-700 rounded-xl text-sm text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-900"/>
                </div>
                <p className="text-xs text-gray-500">Earn 5% APY + share of platform fees (0.5% of all payments)</p>
                <button onClick={handleStake} disabled={loading || !stakeAmt}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors disabled:opacity-50">
                  {loading ? 'Staking...' : 'Stake Now'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Withdraw */}
        {tab === "Withdraw" && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
                <p className="text-xs text-gray-500 mb-1">Staked Balance</p>
                <span className="text-3xl font-bold text-white">{staked.amount} A0GI</span>
              </div>
              <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
                <p className="text-xs text-gray-500 mb-1">Claimable Earnings</p>
                <span className="text-3xl font-bold text-green-600">{earnings} A0GI</span>
              </div>
            </div>

            <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800 max-w-lg space-y-4">
              <div>
                <h3 className="text-base font-bold text-white mb-2">Unstake</h3>
                <p className="text-sm text-gray-500 mb-4">Withdraw your staked A0GI + accumulated rewards</p>
                <button onClick={handleUnstake} disabled={loading || staked.amount === "0"}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors disabled:opacity-50">
                  {loading ? 'Processing...' : `Unstake ${staked.amount} A0GI`}
                </button>
              </div>

              <div className="pt-4 border-t border-gray-800">
                <h3 className="text-base font-bold text-white mb-2">Claim Revenue Share</h3>
                <p className="text-sm text-gray-500 mb-4">Claim your share of platform fees</p>
                <button onClick={handleClaimEarnings} disabled={loading || earnings === "0"}
                  className="w-full py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl transition-colors disabled:opacity-50">
                  {loading ? 'Claiming...' : `Claim ${earnings} A0GI`}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Agent Escrow */}
        {tab === "Agent Escrow" && (
          <div className="space-y-5">
            <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
              <h2 className="text-base font-bold text-white mb-1">Agent-to-Agent Micropayments</h2>
              <p className="text-xs text-gray-500 mb-5">Open a payment channel with another agent. Agent B claims A0GI per API call rendered.</p>

              {/* Open / Top-up Channel */}
              <div className="space-y-3 mb-6">
                <h3 className="text-sm font-semibold text-gray-300">Open Channel (Agent A → Agent B)</h3>
                <input type="text" value={escrowAgentB} onChange={e => setEscrowAgentB(e.target.value)} placeholder="Agent B address (0x...)"
                  className="w-full px-4 py-3 border border-gray-700 rounded-xl text-sm text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-900"/>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Price per call (A0GI)</label>
                    <input type="number" value={escrowPrice} onChange={e => setEscrowPrice(e.target.value)} placeholder="0.001"
                      className="w-full px-4 py-3 border border-gray-700 rounded-xl text-sm text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-900"/>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Deposit amount (A0GI)</label>
                    <input type="number" value={escrowDeposit} onChange={e => setEscrowDeposit(e.target.value)} placeholder="0.1"
                      className="w-full px-4 py-3 border border-gray-700 rounded-xl text-sm text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-900"/>
                  </div>
                </div>
                <button onClick={handleEscrowDeposit} disabled={escrowLoading || !escrowAgentB || !escrowPrice || !escrowDeposit}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl transition-colors disabled:opacity-50">
                  {escrowLoading ? 'Processing...' : 'Open / Top-up Channel'}
                </button>
              </div>

              {/* Settle Call (Agent B) */}
              <div className="space-y-3 mb-6 pt-5 border-t border-gray-800">
                <h3 className="text-sm font-semibold text-gray-300">Claim Payment (Agent B)</h3>
                <input type="text" value={escrowAgentA} onChange={e => setEscrowAgentA(e.target.value)} placeholder="Agent A address (0x...)"
                  className="w-full px-4 py-3 border border-gray-700 rounded-xl text-sm text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-900"/>
                <div className="grid grid-cols-2 gap-3">
                  <button onClick={handleEscrowSettle} disabled={escrowLoading || !escrowAgentA}
                    className="py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl transition-colors disabled:opacity-50">
                    {escrowLoading ? 'Processing...' : 'Claim Per Call'}
                  </button>
                  <button onClick={handleEscrowWithdraw} disabled={escrowLoading || !escrowAgentB}
                    className="py-3 bg-gray-700 hover:bg-gray-600 text-white font-semibold rounded-xl transition-colors disabled:opacity-50">
                    {escrowLoading ? 'Processing...' : 'Withdraw Balance'}
                  </button>
                </div>
              </div>

              {/* Check Channel */}
              <div className="space-y-3 pt-5 border-t border-gray-800">
                <h3 className="text-sm font-semibold text-gray-300">Check Channel State</h3>
                <button onClick={handleEscrowCheck} disabled={escrowLoading || !escrowAgentA || !escrowAgentB}
                  className="w-full py-2.5 border border-gray-700 text-gray-400 text-sm font-medium rounded-xl hover:bg-gray-800 transition-colors disabled:opacity-50">
                  {escrowLoading ? 'Loading...' : 'Check Channel'}
                </button>
                {escrowChannel && (
                  <div className="grid grid-cols-2 gap-3 mt-3">
                    {[
                      { label: 'Balance',       value: `${escrowChannel.balance} A0GI` },
                      { label: 'Price/Call',    value: `${escrowChannel.pricePerCall} A0GI` },
                      { label: 'Total Calls',   value: escrowChannel.totalCalls },
                      { label: 'Total Paid',    value: `${escrowChannel.totalPaid} A0GI` },
                    ].map(item => (
                      <div key={item.label} className="p-3 bg-gray-800 rounded-xl">
                        <p className="text-xs text-gray-500 mb-1">{item.label}</p>
                        <p className="text-sm font-bold text-white">{item.value}</p>
                      </div>
                    ))}
                    <div className="col-span-2 p-3 bg-gray-800 rounded-xl">
                      <p className="text-xs text-gray-500 mb-1">Status</p>
                      <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                        escrowChannel.active ? 'bg-emerald-500/10 text-emerald-400' : 'bg-gray-700 text-gray-500'
                      }`}>{escrowChannel.active ? 'Active' : 'Closed'}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

      </div>
    </>
  );
}
