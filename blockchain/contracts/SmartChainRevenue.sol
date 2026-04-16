// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title SmartChainRevenue
 * @dev Manages the automated distribution of transaction fees to stakeholders.
 */
contract SmartChainRevenue is Ownable, ReentrancyGuard {
    
    mapping(address => uint256) public pendingEarnings;
    uint256 public totalDistributed;
    uint256 public constant SHARE_PERCENTAGE = 10; // 10% back to community

    event RevenueDistributed(address indexed stakeholder, uint256 amount);
    event EarningsClaimed(address indexed stakeholder, uint256 amount);

    constructor() Ownable(msg.sender) {}

    /**
     * @dev Distributes revenue to a stakeholder. 
     * Added nonReentrant for security.
     */
    function distributeRevenue(address _stakeholder, uint256 _totalFee) external onlyOwner nonReentrant {
        uint256 share = (_totalFee * SHARE_PERCENTAGE) / 100;
        pendingEarnings[_stakeholder] += share;
        totalDistributed += share;
        
        emit RevenueDistributed(_stakeholder, share);
    }

    /**
     * @dev Allows stakeholders to claim their accumulated earnings.
     * nonReentrant ensures protection against reentrancy attacks during transfer.
     */
    function claimEarnings() external nonReentrant {
        uint256 amount = pendingEarnings[msg.sender];
        require(amount > 0, "No earnings to claim");

        pendingEarnings[msg.sender] = 0;
        
        (bool success, ) = msg.sender.call{value: amount}("");
        require(success, "Transfer failed");

        emit EarningsClaimed(msg.sender, amount);
    }

    /**
     * @dev Fallback to receive funds for distribution
     */
    receive() external payable {}
}
