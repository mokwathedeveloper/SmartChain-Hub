// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title SmartChainAgentMarket
 * @notice Hire-market for SmartChain AI agents.
 *         Owners list their trained AI agent for hire; other wallets pay a
 *         per-task fee. Revenue split: 90% to agent owner, 10% protocol fee.
 *
 * @dev    Deployed on 0G Galileo Testnet (chainId 16602).
 *         SmartChain Hub — 0G APAC Hackathon 2026, Track 3: Agentic Economy.
 *
 *         Gas-optimised: no OZ imports, bytes32 specialty/modelHash,
 *         HireRecords emitted as events (not stored) to minimise deployment gas.
 */
contract SmartChainAgentMarket {

    address public owner;
    bool    private _locked;

    modifier onlyOwner()    { require(msg.sender == owner,  "Not owner");  _; }
    modifier nonReentrant() { require(!_locked, "Reentrant"); _locked = true; _; _locked = false; }

    uint256 public constant PROTOCOL_FEE_BPS = 1000;   // 10 %
    uint256 public constant BPS_BASE         = 10_000;

    struct AgentListing {
        address  owner;
        uint256  pricePerTask;
        bytes32  specialty;    // UTF-8 string, max 32 bytes (truncated off-chain if longer)
        bytes32  modelHash;    // TF model version identifier
        uint256  totalHires;
        uint256  totalEarned;
        bool     active;
        uint256  listedAt;
    }

    mapping(address => AgentListing) public listings;
    mapping(address => bool)         private everListed;
    address[] public listedOwners;

    uint256 public totalHires;
    uint256 public totalVolumeWei;
    uint256 public collectedProtocolFees;

    event AgentListed(address indexed owner, uint256 pricePerTask, bytes32 specialty);
    event AgentDelisted(address indexed owner);
    // HireRecord is event-only (not stored in a mapping) to save deployment gas.
    event AgentHired(
        uint256 indexed hireId,
        address indexed hirer,
        address indexed agentOwner,
        uint256 paidWei,
        string  taskRef
    );
    event FeesWithdrawn(address indexed to, uint256 amount);

    constructor() { owner = msg.sender; }

    function listAgent(uint256 _pricePerTask, bytes32 _specialty, bytes32 _modelHash) external {
        require(_pricePerTask > 0, "Price > 0");
        if (!everListed[msg.sender]) {
            listedOwners.push(msg.sender);
            everListed[msg.sender] = true;
        }
        AgentListing storage l = listings[msg.sender];
        l.owner        = msg.sender;
        l.pricePerTask = _pricePerTask;
        l.specialty    = _specialty;
        l.modelHash    = _modelHash;
        l.active       = true;
        l.listedAt     = block.timestamp;
        emit AgentListed(msg.sender, _pricePerTask, _specialty);
    }

    function delistAgent() external {
        require(listings[msg.sender].active, "Not listed");
        listings[msg.sender].active = false;
        emit AgentDelisted(msg.sender);
    }

    function hireAgent(address _agentOwner, string calldata _taskRef)
        external payable nonReentrant
    {
        AgentListing storage l = listings[_agentOwner];
        require(l.active,               "Not listed");
        require(msg.value >= l.pricePerTask, "Low payment");

        uint256 protocolShare = (msg.value * PROTOCOL_FEE_BPS) / BPS_BASE;
        uint256 ownerShare    = msg.value - protocolShare;

        l.totalHires++;
        l.totalEarned        += ownerShare;
        collectedProtocolFees += protocolShare;
        totalHires++;
        totalVolumeWei += msg.value;

        emit AgentHired(totalHires, msg.sender, _agentOwner, msg.value, _taskRef);

        (bool ok,) = payable(_agentOwner).call{value: ownerShare}("");
        require(ok, "Payment failed");
    }

    function getActiveListings() external view returns (AgentListing[] memory) {
        uint256 count;
        for (uint256 i; i < listedOwners.length; i++) {
            if (listings[listedOwners[i]].active) count++;
        }
        AgentListing[] memory result = new AgentListing[](count);
        uint256 idx;
        for (uint256 i; i < listedOwners.length; i++) {
            if (listings[listedOwners[i]].active) result[idx++] = listings[listedOwners[i]];
        }
        return result;
    }

    function getListing(address _owner) external view returns (AgentListing memory) {
        return listings[_owner];
    }

    function getMarketStats() external view returns (uint256 listed, uint256 hiresTotal, uint256 volumeWei) {
        uint256 active;
        for (uint256 i; i < listedOwners.length; i++) {
            if (listings[listedOwners[i]].active) active++;
        }
        return (active, totalHires, totalVolumeWei);
    }

    function withdrawProtocolFees(address payable _to) external onlyOwner nonReentrant {
        uint256 amount = collectedProtocolFees;
        require(amount > 0, "Nothing to withdraw");
        collectedProtocolFees = 0;
        (bool ok,) = _to.call{value: amount}("");
        require(ok, "Withdraw failed");
        emit FeesWithdrawn(_to, amount);
    }
}
