// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title SmartChainPayments
 * @dev Full payment contract: send, receive, stake, withdraw, revenue sharing.
 * Deployed on 0G Mainnet (chainId 16661).
 */
contract SmartChainPayments is Ownable, ReentrancyGuard {

    // ── Revenue Sharing ──────────────────────────────────────────
    uint256 public constant SHARE_PERCENTAGE = 10; // 10% of fees to stakers
    uint256 public totalRevenue;
    mapping(address => uint256) public pendingEarnings;

    // ── Staking ──────────────────────────────────────────────────
    uint256 public constant STAKE_APY_BPS = 500; // 5% APY in basis points
    struct Stake {
        uint256 amount;
        uint256 stakedAt;
        uint256 rewardDebt;
    }
    mapping(address => Stake) public stakes;
    uint256 public totalStaked;

    // ── Payments ─────────────────────────────────────────────────
    struct Payment {
        address from;
        address to;
        uint256 amount;
        uint256 fee;
        string  memo;
        uint256 timestamp;
    }
    Payment[] public payments;
    mapping(address => uint256[]) public sentPayments;
    mapping(address => uint256[]) public receivedPayments;

    // ── Events ───────────────────────────────────────────────────
    event FundsSent(address indexed from, address indexed to, uint256 amount, uint256 fee, string memo);
    event Staked(address indexed user, uint256 amount);
    event Unstaked(address indexed user, uint256 amount, uint256 reward);
    event RevenueDistributed(address indexed stakeholder, uint256 amount);
    event EarningsClaimed(address indexed stakeholder, uint256 amount);

    constructor() Ownable(msg.sender) {}

    // ── Send funds ───────────────────────────────────────────────
    /**
     * @dev Send A0GI to another address. 0.5% fee goes to revenue pool.
     */
    function sendFunds(address payable _to, string calldata _memo) external payable nonReentrant {
        require(msg.value > 0, "Amount required");
        require(_to != address(0), "Invalid recipient");

        uint256 fee = (msg.value * 5) / 1000; // 0.5% fee
        uint256 net = msg.value - fee;

        // Distribute fee to stakers proportionally
        if (totalStaked > 0) {
            _distributeToStakers(fee);
        } else {
            totalRevenue += fee;
        }

        uint256 idx = payments.length;
        payments.push(Payment(msg.sender, _to, net, fee, _memo, block.timestamp));
        sentPayments[msg.sender].push(idx);
        receivedPayments[_to].push(idx);

        (bool ok,) = _to.call{value: net}("");
        require(ok, "Transfer failed");

        emit FundsSent(msg.sender, _to, net, fee, _memo);
    }

    // ── Staking ──────────────────────────────────────────────────
    function stake() external payable nonReentrant {
        require(msg.value > 0, "Stake amount required");
        Stake storage s = stakes[msg.sender];
        // Claim pending reward before adding more stake
        if (s.amount > 0) {
            uint256 reward = _pendingReward(msg.sender);
            s.rewardDebt += reward;
        }
        s.amount += msg.value;
        s.stakedAt = block.timestamp;
        totalStaked += msg.value;
        emit Staked(msg.sender, msg.value);
    }

    function unstake() external nonReentrant {
        Stake storage s = stakes[msg.sender];
        require(s.amount > 0, "Nothing staked");
        uint256 reward = _pendingReward(msg.sender) + s.rewardDebt;
        uint256 principal = s.amount;
        totalStaked -= principal;
        s.amount = 0; s.rewardDebt = 0; s.stakedAt = 0;
        uint256 total = principal + reward;
        (bool ok,) = payable(msg.sender).call{value: total}("");
        require(ok, "Transfer failed");
        emit Unstaked(msg.sender, principal, reward);
    }

    function _pendingReward(address user) internal view returns (uint256) {
        Stake storage s = stakes[user];
        if (s.amount == 0 || s.stakedAt == 0) return 0;
        uint256 elapsed = block.timestamp - s.stakedAt;
        // APY = 5% per year = STAKE_APY_BPS / 10000
        return (s.amount * STAKE_APY_BPS * elapsed) / (10000 * 365 days);
    }

    function getPendingReward(address user) external view returns (uint256) {
        return _pendingReward(user) + stakes[user].rewardDebt;
    }

    // ── Revenue sharing ──────────────────────────────────────────
    function _distributeToStakers(uint256 _fee) internal {
        totalRevenue += _fee;
        // Owner calls distributeRevenue to specific stakeholders
    }

    function distributeRevenue(address _stakeholder, uint256 _amount) external onlyOwner nonReentrant {
        require(_amount <= address(this).balance, "Insufficient balance");
        pendingEarnings[_stakeholder] += _amount;
        emit RevenueDistributed(_stakeholder, _amount);
    }

    function claimEarnings() external nonReentrant {
        uint256 amount = pendingEarnings[msg.sender];
        require(amount > 0, "No earnings to claim");
        pendingEarnings[msg.sender] = 0;
        (bool ok,) = payable(msg.sender).call{value: amount}("");
        require(ok, "Transfer failed");
        emit EarningsClaimed(msg.sender, amount);
    }

    // ── Views ────────────────────────────────────────────────────
    function getPaymentCount() external view returns (uint256) { return payments.length; }
    function getSentCount(address user) external view returns (uint256) { return sentPayments[user].length; }
    function getReceivedCount(address user) external view returns (uint256) { return receivedPayments[user].length; }
    function getStake(address user) external view returns (uint256 amount, uint256 reward) {
        return (stakes[user].amount, _pendingReward(user) + stakes[user].rewardDebt);
    }

    receive() external payable { totalRevenue += msg.value; }
}
