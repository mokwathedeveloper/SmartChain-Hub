// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title SmartChainTransaction v2
 * @notice Records AI-optimized transactions on 0G Chain with full provenance:
 *         savings amount, 0G Storage root hash, and cumulative on-chain stats.
 * @dev    Deployed on 0G Galileo Testnet (chainId 16602) and 0G Mainnet (chainId 16661).
 *         SmartChain Hub — 0G APAC Hackathon 2026, Track 3: Agentic Economy.
 */
contract SmartChainTransaction is Ownable, ReentrancyGuard {

    struct Transaction {
        address sender;
        uint256 amount;      // transaction amount in wei-equivalent
        uint256 fee;         // AI-optimized fee in wei-equivalent
        uint256 savings;     // savings vs baseline fee in wei-equivalent
        string  route;       // e.g. "0G Chain Flash Route"
        bytes32 storageRoot; // 0G Storage Merkle root for this record
        bool    validated;
        uint256 timestamp;
    }

    mapping(bytes32 => Transaction) public transactions;

    uint256 public totalOptimizations;
    uint256 public totalSavingsWei;

    event TransactionRecorded(
        bytes32 indexed txHash,
        address indexed sender,
        uint256 amount,
        uint256 savings,
        bytes32 storageRoot
    );
    event TransactionValidated(bytes32 indexed txHash, address indexed sender);

    constructor() Ownable(msg.sender) {}

    /**
     * @dev Records an AI-optimized transaction with 0G Storage proof.
     *      Called by the frontend after each confirmed optimization.
     */
    function recordTransaction(
        bytes32          _txHash,
        uint256          _amount,
        uint256          _fee,
        uint256          _savings,
        string  calldata _route,
        bytes32          _storageRoot
    ) external nonReentrant {
        require(transactions[_txHash].sender == address(0), "Transaction already recorded");
        require(_savings <= _fee, "Savings cannot exceed fee");

        transactions[_txHash] = Transaction({
            sender:      msg.sender,
            amount:      _amount,
            fee:         _fee,
            savings:     _savings,
            route:       _route,
            storageRoot: _storageRoot,
            validated:   false,
            timestamp:   block.timestamp
        });

        totalOptimizations++;
        totalSavingsWei += _savings;

        emit TransactionRecorded(_txHash, msg.sender, _amount, _savings, _storageRoot);
    }

    /**
     * @dev Owner validates a transaction (marks it confirmed on-chain).
     */
    function validateTransaction(bytes32 _txHash) external onlyOwner nonReentrant {
        require(transactions[_txHash].sender != address(0), "Transaction does not exist");
        require(!transactions[_txHash].validated, "Already validated");
        transactions[_txHash].validated = true;
        emit TransactionValidated(_txHash, transactions[_txHash].sender);
    }

    function getTransaction(bytes32 _txHash) external view returns (Transaction memory) {
        return transactions[_txHash];
    }

    /**
     * @dev Returns global optimizer stats — displayed on the leaderboard and landing page.
     */
    function getStats() external view returns (uint256 total, uint256 savings) {
        return (totalOptimizations, totalSavingsWei);
    }
}
