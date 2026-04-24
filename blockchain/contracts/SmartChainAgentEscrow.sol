// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title SmartChainAgentEscrow
 * @author SmartChain Hub
 * @notice Agent-to-Agent micropayment escrow for the agentic economy.
 *
 * Flow:
 *   1. Agent A calls deposit() to fund an escrow channel with Agent B.
 *   2. Agent B calls payPerCall() after each API service rendered.
 *   3. Agent A can withdraw unused balance at any time.
 *   4. Platform takes a 1% fee on each payPerCall settlement.
 *
 * Both agents are identified by their SmartChainAgentID (wallet address).
 * Deployed on 0G Galileo Testnet — Chain ID 16602.
 */
contract SmartChainAgentEscrow is Ownable, ReentrancyGuard {

    uint256 public constant PLATFORM_FEE_BPS = 100; // 1% in basis points
    uint256 public totalFeesCollected;

    struct Channel {
        address agentA;       // payer — deposits funds
        address agentB;       // service provider — claims per call
        uint256 balance;      // remaining deposited balance
        uint256 pricePerCall; // A0GI per API call (set by agentA)
        uint256 totalCalls;   // lifetime call count
        uint256 totalPaid;    // lifetime A0GI paid to agentB
        bool    active;
    }

    // channelId => Channel
    mapping(bytes32 => Channel) public channels;
    // agentAddress => channelIds they participate in
    mapping(address => bytes32[]) public agentChannels;

    event ChannelOpened(bytes32 indexed channelId, address indexed agentA, address indexed agentB, uint256 pricePerCall);
    event CallSettled(bytes32 indexed channelId, address indexed agentB, uint256 amount, uint256 callCount);
    event ChannelToppedUp(bytes32 indexed channelId, uint256 added, uint256 newBalance);
    event ChannelWithdrawn(bytes32 indexed channelId, address indexed agentA, uint256 amount);
    event ChannelClosed(bytes32 indexed channelId);

    constructor() Ownable(msg.sender) {}

    // ── Channel ID ────────────────────────────────────────────────────────────

    function channelId(address _agentA, address _agentB) public pure returns (bytes32) {
        return keccak256(abi.encodePacked(_agentA, _agentB));
    }

    // ── Open / fund a channel ─────────────────────────────────────────────────

    /**
     * @dev Agent A opens (or tops up) a payment channel with Agent B.
     *      msg.value is deposited into the channel.
     *      pricePerCall is only set on first open; ignored on top-up.
     */
    function deposit(address _agentB, uint256 _pricePerCall) external payable nonReentrant {
        require(msg.value > 0,          "Deposit amount required");
        require(_agentB != address(0),  "Invalid agent B address");
        require(_agentB != msg.sender,  "Cannot open channel with yourself");
        require(_pricePerCall > 0,      "Price per call must be > 0");

        bytes32 cid = channelId(msg.sender, _agentB);
        Channel storage ch = channels[cid];

        if (!ch.active) {
            // New channel
            ch.agentA        = msg.sender;
            ch.agentB        = _agentB;
            ch.pricePerCall  = _pricePerCall;
            ch.active        = true;
            agentChannels[msg.sender].push(cid);
            agentChannels[_agentB].push(cid);
            emit ChannelOpened(cid, msg.sender, _agentB, _pricePerCall);
        }

        ch.balance += msg.value;
        emit ChannelToppedUp(cid, msg.value, ch.balance);
    }

    // ── Agent B claims payment per API call ───────────────────────────────────

    /**
     * @dev Agent B calls this after rendering a service to Agent A.
     *      Deducts pricePerCall from channel balance, takes 1% platform fee,
     *      and transfers net amount to Agent B.
     */
    function payPerCall(address _agentA) external nonReentrant {
        bytes32 cid = channelId(_agentA, msg.sender);
        Channel storage ch = channels[cid];

        require(ch.active,                      "Channel not active");
        require(ch.agentB == msg.sender,        "Caller is not agent B");
        require(ch.balance >= ch.pricePerCall,  "Insufficient channel balance");

        uint256 gross = ch.pricePerCall;
        uint256 fee   = (gross * PLATFORM_FEE_BPS) / 10_000;
        uint256 net   = gross - fee;

        ch.balance     -= gross;
        ch.totalCalls  += 1;
        ch.totalPaid   += net;
        totalFeesCollected += fee;

        (bool ok,) = payable(msg.sender).call{value: net}("");
        require(ok, "Transfer to agent B failed");

        emit CallSettled(cid, msg.sender, net, ch.totalCalls);
    }

    // ── Agent A withdraws unused balance ──────────────────────────────────────

    /**
     * @dev Agent A withdraws remaining balance from a channel.
     *      Channel is closed after full withdrawal.
     */
    function withdraw(address _agentB) external nonReentrant {
        bytes32 cid = channelId(msg.sender, _agentB);
        Channel storage ch = channels[cid];

        require(ch.active,              "Channel not active");
        require(ch.agentA == msg.sender, "Caller is not agent A");
        require(ch.balance > 0,         "Nothing to withdraw");

        uint256 amount = ch.balance;
        ch.balance = 0;
        ch.active  = false;

        (bool ok,) = payable(msg.sender).call{value: amount}("");
        require(ok, "Withdrawal failed");

        emit ChannelWithdrawn(cid, msg.sender, amount);
        emit ChannelClosed(cid);
    }

    // ── Owner: collect platform fees ──────────────────────────────────────────

    function collectFees() external onlyOwner nonReentrant {
        uint256 amount = totalFeesCollected;
        require(amount > 0, "No fees to collect");
        totalFeesCollected = 0;
        (bool ok,) = payable(owner()).call{value: amount}("");
        require(ok, "Fee collection failed");
    }

    // ── Views ─────────────────────────────────────────────────────────────────

    function getChannel(address _agentA, address _agentB) external view returns (Channel memory) {
        return channels[channelId(_agentA, _agentB)];
    }

    function getAgentChannelCount(address _agent) external view returns (uint256) {
        return agentChannels[_agent].length;
    }

    receive() external payable {}
}
