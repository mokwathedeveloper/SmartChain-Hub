// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title SmartChainRevenue
 * @author SmartChain Hub
 * @notice Automated proportional revenue distribution to registered stakers on 0G Chain.
 * @dev 10% of every transaction fee is distributed proportionally to stakers by stake weight.
 *      Stakers register via registerStaker() with a stake amount.
 *      distributeRevenue() splits the fee share proportionally across all registered stakers.
 */
contract SmartChainRevenue is Ownable, ReentrancyGuard {

    struct Staker {
        uint256 stakeAmount;
        uint256 pendingEarnings;
        bool    registered;
    }

    mapping(address => Staker) public stakers;
    address[] public stakerList;

    uint256 public totalStaked;
    uint256 public totalDistributed;
    uint256 public constant SHARE_PERCENTAGE = 10; // 10% of fee back to stakers

    event StakerRegistered(address indexed staker, uint256 stakeAmount);
    event StakerDeregistered(address indexed staker);
    event RevenueDistributed(uint256 totalFee, uint256 shareAmount, uint256 stakerCount);
    event EarningsClaimed(address indexed staker, uint256 amount);

    constructor() Ownable(msg.sender) {}

    /**
     * @dev Register as a staker with a stake weight.
     *      Stake amount is a weight unit — no ETH locked here (staking handled by SmartChainPayments).
     */
    function registerStaker(uint256 _stakeAmount) external {
        require(_stakeAmount > 0, "Stake amount must be > 0");
        require(!stakers[msg.sender].registered, "Already registered");

        stakers[msg.sender] = Staker({
            stakeAmount:     _stakeAmount,
            pendingEarnings: 0,
            registered:      true
        });
        stakerList.push(msg.sender);
        totalStaked += _stakeAmount;

        emit StakerRegistered(msg.sender, _stakeAmount);
    }

    /**
     * @dev Deregister and forfeit pending earnings (or claim first).
     */
    function deregisterStaker() external {
        require(stakers[msg.sender].registered, "Not registered");
        totalStaked -= stakers[msg.sender].stakeAmount;
        stakers[msg.sender].registered  = false;
        stakers[msg.sender].stakeAmount = 0;

        // Remove from list
        for (uint256 i = 0; i < stakerList.length; i++) {
            if (stakerList[i] == msg.sender) {
                stakerList[i] = stakerList[stakerList.length - 1];
                stakerList.pop();
                break;
            }
        }
        emit StakerDeregistered(msg.sender);
    }

    /**
     * @dev Distribute revenue proportionally to all registered stakers by stake weight.
     *      Called by owner (backend) after each transaction fee is collected.
     *      Funds must be sent with this call (msg.value = fee share to distribute).
     */
    function distributeRevenue(uint256 _totalFee) external payable onlyOwner nonReentrant {
        uint256 shareAmount = (_totalFee * SHARE_PERCENTAGE) / 100;
        require(msg.value >= shareAmount, "Insufficient ETH sent for distribution");
        require(totalStaked > 0, "No stakers registered");

        uint256 stakerCount = stakerList.length;
        uint256 distributed = 0;

        for (uint256 i = 0; i < stakerCount; i++) {
            address stakerAddr = stakerList[i];
            Staker storage s = stakers[stakerAddr];
            if (!s.registered || s.stakeAmount == 0) continue;

            // Proportional share: (stakerWeight / totalStaked) * shareAmount
            uint256 stakerShare = (s.stakeAmount * shareAmount) / totalStaked;
            s.pendingEarnings += stakerShare;
            distributed += stakerShare;
        }

        totalDistributed += distributed;

        // Refund any dust back to owner
        uint256 dust = msg.value - distributed;
        if (dust > 0) {
            (bool ok,) = owner().call{value: dust}("");
            require(ok, "Dust refund failed");
        }

        emit RevenueDistributed(_totalFee, distributed, stakerCount);
    }

    /**
     * @dev Claim accumulated earnings.
     */
    function claimEarnings() external nonReentrant {
        Staker storage s = stakers[msg.sender];
        uint256 amount = s.pendingEarnings;
        require(amount > 0, "No earnings to claim");

        s.pendingEarnings = 0;

        (bool success,) = msg.sender.call{value: amount}("");
        require(success, "Transfer failed");

        emit EarningsClaimed(msg.sender, amount);
    }

    /**
     * @dev View pending earnings for any staker.
     */
    function getPendingEarnings(address _staker) external view returns (uint256) {
        return stakers[_staker].pendingEarnings;
    }

    /**
     * @dev View all registered stakers.
     */
    function getStakerCount() external view returns (uint256) {
        return stakerList.length;
    }

    receive() external payable {}
}
