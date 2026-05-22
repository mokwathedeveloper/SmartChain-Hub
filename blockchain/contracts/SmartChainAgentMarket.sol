// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title SmartChainAgentMarket
 * @notice Hire-market for SmartChain AI agents.
 *         Agents remain soulbound to their owners (AgentID is non-transferable).
 *         Owners can list their trained agent for hire — other wallets pay
 *         a per-task fee to use the agent's optimization model.
 *
 *         Revenue split: 90% to agent owner, 10% protocol fee.
 *
 * @dev    Deployed on 0G Galileo Testnet (chainId 16602).
 *         SmartChain Hub — 0G APAC Hackathon 2026, Track 3: Agentic Economy.
 */
contract SmartChainAgentMarket is Ownable, ReentrancyGuard {

    uint256 public constant PROTOCOL_FEE_BPS = 1000; // 10 %
    uint256 public constant BPS_BASE         = 10_000;

    struct AgentListing {
        address  owner;
        uint256  pricePerTask;   // in wei
        string   specialty;      // e.g. "DeFi Routing", "Cross-chain Arbitrage"
        string   modelHash;      // TF model version identifier
        uint256  totalHires;
        uint256  totalEarned;    // cumulative wei earned
        bool     active;
        uint256  listedAt;
    }

    struct HireRecord {
        address  hirer;
        address  agentOwner;
        uint256  paidWei;
        uint256  ownerShareWei;
        string   taskRef;        // off-chain reference (storage root / DA blob ID)
        uint256  timestamp;
    }

    // agentOwner → listing
    mapping(address => AgentListing) public listings;
    address[] public listedOwners;

    // hireId → record
    mapping(uint256 => HireRecord) public hires;
    uint256 public totalHires;
    uint256 public totalVolumeWei;

    uint256 public collectedProtocolFees;

    event AgentListed(address indexed owner, uint256 pricePerTask, string specialty);
    event AgentDelisted(address indexed owner);
    event AgentHired(uint256 indexed hireId, address indexed hirer, address indexed agentOwner, uint256 paidWei, string taskRef);
    event FeesWithdrawn(address indexed to, uint256 amount);

    constructor() Ownable(msg.sender) {}

    /**
     * @dev List your agent for hire. Overwrites any existing listing.
     */
    function listAgent(
        uint256 _pricePerTask,
        string  calldata _specialty,
        string  calldata _modelHash
    ) external {
        require(_pricePerTask > 0, "Price must be > 0");

        if (!listings[msg.sender].active) {
            listedOwners.push(msg.sender);
        }

        listings[msg.sender] = AgentListing({
            owner:         msg.sender,
            pricePerTask:  _pricePerTask,
            specialty:     _specialty,
            modelHash:     _modelHash,
            totalHires:    listings[msg.sender].totalHires,
            totalEarned:   listings[msg.sender].totalEarned,
            active:        true,
            listedAt:      block.timestamp
        });

        emit AgentListed(msg.sender, _pricePerTask, _specialty);
    }

    /**
     * @dev Remove your agent from the marketplace.
     */
    function delistAgent() external {
        require(listings[msg.sender].active, "Not listed");
        listings[msg.sender].active = false;
        emit AgentDelisted(msg.sender);
    }

    /**
     * @dev Hire an agent — pay the listed price. 90% goes to owner, 10% protocol.
     * @param _agentOwner  wallet that listed the agent
     * @param _taskRef     off-chain task reference (DA blob ID / storage root)
     */
    function hireAgent(address _agentOwner, string calldata _taskRef)
        external payable nonReentrant
    {
        AgentListing storage listing = listings[_agentOwner];
        require(listing.active, "Agent not listed");
        require(msg.value >= listing.pricePerTask, "Insufficient payment");

        uint256 protocolShare = (msg.value * PROTOCOL_FEE_BPS) / BPS_BASE;
        uint256 ownerShare    = msg.value - protocolShare;

        listing.totalHires++;
        listing.totalEarned += ownerShare;
        collectedProtocolFees += protocolShare;
        totalHires++;
        totalVolumeWei += msg.value;

        uint256 hireId = totalHires;
        hires[hireId] = HireRecord({
            hirer:         msg.sender,
            agentOwner:    _agentOwner,
            paidWei:       msg.value,
            ownerShareWei: ownerShare,
            taskRef:       _taskRef,
            timestamp:     block.timestamp
        });

        // Pay agent owner immediately
        (bool ok, ) = payable(_agentOwner).call{ value: ownerShare }("");
        require(ok, "Payment to agent owner failed");

        emit AgentHired(hireId, msg.sender, _agentOwner, msg.value, _taskRef);
    }

    /**
     * @dev Returns all active listings.
     */
    function getActiveListings() external view returns (AgentListing[] memory) {
        uint256 count;
        for (uint256 i = 0; i < listedOwners.length; i++) {
            if (listings[listedOwners[i]].active) count++;
        }
        AgentListing[] memory result = new AgentListing[](count);
        uint256 idx;
        for (uint256 i = 0; i < listedOwners.length; i++) {
            if (listings[listedOwners[i]].active) {
                result[idx++] = listings[listedOwners[i]];
            }
        }
        return result;
    }

    function getListing(address _owner) external view returns (AgentListing memory) {
        return listings[_owner];
    }

    function getMarketStats() external view returns (uint256 listed, uint256 hiresTotal, uint256 volumeWei) {
        uint256 activeCount;
        for (uint256 i = 0; i < listedOwners.length; i++) {
            if (listings[listedOwners[i]].active) activeCount++;
        }
        return (activeCount, totalHires, totalVolumeWei);
    }

    function withdrawProtocolFees(address payable _to) external onlyOwner nonReentrant {
        uint256 amount = collectedProtocolFees;
        require(amount > 0, "Nothing to withdraw");
        collectedProtocolFees = 0;
        (bool ok, ) = _to.call{ value: amount }("");
        require(ok, "Withdrawal failed");
        emit FeesWithdrawn(_to, amount);
    }
}
