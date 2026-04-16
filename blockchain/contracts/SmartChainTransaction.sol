// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title SmartChainTransaction
 * @dev Handles validation and recording of AI-optimized transactions on 0G Chain.
 */
contract SmartChainTransaction is Ownable {
    
    struct Transaction {
        address sender;
        uint256 amount;
        uint256 fee;
        string route;
        bool validated;
        uint256 timestamp;
    }

    mapping(bytes32 => Transaction) public transactions;
    
    event TransactionValidated(bytes32 indexed txHash, address indexed sender, uint256 amount);
    event TransactionRecorded(bytes32 indexed txHash, address indexed sender, uint256 amount);

    constructor() Ownable(msg.sender) {}

    /**
     * @dev Records a new transaction hash and its details.
     */
    function recordTransaction(
        bytes32 _txHash, 
        uint256 _amount, 
        uint256 _fee, 
        string memory _route
    ) external {
        require(transactions[_txHash].sender == address(0), "Transaction already exists");
        
        transactions[_txHash] = Transaction({
            sender: msg.sender,
            amount: _amount,
            fee: _fee,
            route: _route,
            validated: false,
            timestamp: block.timestamp
        });

        emit TransactionRecorded(_txHash, msg.sender, _amount);
    }

    /**
     * @dev Validates a transaction. In a real scenario, this might be called by an AI Agent oracle.
     */
    function validateTransaction(bytes32 _txHash) external onlyOwner {
        require(transactions[_txHash].sender != address(0), "Transaction does not exist");
        require(!transactions[_txHash].validated, "Already validated");

        transactions[_txHash].validated = true;
        
        emit TransactionValidated(_txHash, transactions[_txHash].sender, transactions[_txHash].amount);
    }

    function getTransaction(bytes32 _txHash) external view returns (Transaction memory) {
        return transactions[_txHash];
    }
}
