// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title SmartChainAgentID
 * @dev Soulbound Agent ID — tokenizes the AI agent's identity, memory, and behavior.
 * Based on 0G Agent ID standard: https://docs.0g.ai/build-with-0g/agent-id
 *
 * Each user gets one non-transferable Agent ID that stores:
 * - memoryRoot: Merkle root of agent memory stored on 0G Storage
 * - modelHash:  Hash of the TF model weights the agent was trained on
 * - reputation: On-chain score incremented with each optimization
 */
contract SmartChainAgentID is Ownable {

    struct AgentIdentity {
        address owner;
        bytes32 memoryRoot;   // 0G Storage KV Merkle root
        bytes32 modelHash;    // TensorFlow model weights hash
        uint256 reputation;   // increments per confirmed optimization
        uint256 totalSavings; // cumulative savings in wei-equivalent
        uint256 mintedAt;
        bool    exists;
    }

    mapping(address => AgentIdentity) public agents;
    mapping(address => bool)          public hasMinted;
    uint256 public totalAgents;

    event AgentMinted(address indexed owner, bytes32 modelHash, uint256 timestamp);
    event MemoryUpdated(address indexed owner, bytes32 newMemoryRoot, uint256 reputation);
    event ReputationIncremented(address indexed owner, uint256 newReputation, uint256 savingsAdded);

    constructor() Ownable(msg.sender) {}

    /**
     * @dev Mint a soulbound Agent ID. One per address, non-transferable.
     */
    function mintAgentID(bytes32 _modelHash) external {
        require(!hasMinted[msg.sender], "Agent ID already minted");

        agents[msg.sender] = AgentIdentity({
            owner:       msg.sender,
            memoryRoot:  bytes32(0),
            modelHash:   _modelHash,
            reputation:  0,
            totalSavings: 0,
            mintedAt:    block.timestamp,
            exists:      true
        });

        hasMinted[msg.sender] = true;
        totalAgents++;

        emit AgentMinted(msg.sender, _modelHash, block.timestamp);
    }

    /**
     * @dev Update agent memory root after 0G Storage KV write.
     * Called by the frontend after each optimization session.
     */
    function updateMemory(bytes32 _newMemoryRoot, uint256 _savingsWei) external {
        require(agents[msg.sender].exists, "No Agent ID - mint first");

        agents[msg.sender].memoryRoot   = _newMemoryRoot;
        agents[msg.sender].reputation  += 1;
        agents[msg.sender].totalSavings += _savingsWei;

        emit MemoryUpdated(msg.sender, _newMemoryRoot, agents[msg.sender].reputation);
        emit ReputationIncremented(msg.sender, agents[msg.sender].reputation, _savingsWei);
    }

    /**
     * @dev Get full agent identity — used by frontend to display agent card.
     */
    function getAgent(address _owner) external view returns (AgentIdentity memory) {
        return agents[_owner];
    }

    /**
     * @dev Owner-only: reset a wallet's mint status so they can mint again.
     * Used for testing and manual mint flows.
     */
    function resetMint(address _wallet) external onlyOwner {
        require(hasMinted[_wallet], "Wallet has not minted");
        hasMinted[_wallet] = false;
        delete agents[_wallet];
        if (totalAgents > 0) totalAgents--;
    }

    /**
     * @dev Soulbound — block all transfers.
     */
    function transfer(address, uint256) external pure {
        revert("Agent ID is soulbound - non-transferable");
    }
}
