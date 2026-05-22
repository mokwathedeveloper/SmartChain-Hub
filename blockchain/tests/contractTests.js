const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("SmartChain Contracts", function () {
  let transaction, revenue, owner, user;

  beforeEach(async () => {
    [owner, user] = await ethers.getSigners();
    const Tx = await ethers.getContractFactory("SmartChainTransaction");
    transaction = await Tx.deploy();
    const Rev = await ethers.getContractFactory("SmartChainRevenue");
    revenue = await Rev.deploy();
  });

  describe("SmartChainTransaction", () => {
    it("records a transaction", async () => {
      const hash = ethers.id("test-tx-1");
      await transaction.connect(user).recordTransaction(
        hash,
        ethers.parseUnits("100", 18),
        ethers.parseUnits("0.5", 18),
        ethers.parseUnits("0.1", 18),
        "0G Flash",
        ethers.ZeroHash,
      );
      const stored = await transaction.getTransaction(hash);
      expect(stored.sender).to.equal(user.address);
      expect(stored.validated).to.equal(false);
    });

    it("reverts on duplicate hash", async () => {
      const hash = ethers.id("test-tx-dup");
      await transaction.connect(user).recordTransaction(hash, 100n, 1n, 0n, "route", ethers.ZeroHash);
      await expect(
        transaction.connect(user).recordTransaction(hash, 100n, 1n, 0n, "route", ethers.ZeroHash)
      ).to.be.revertedWith("Transaction already recorded");
    });

    it("owner can validate", async () => {
      const hash = ethers.id("test-tx-val");
      await transaction.connect(user).recordTransaction(hash, 100n, 1n, 0n, "route", ethers.ZeroHash);
      await transaction.connect(owner).validateTransaction(hash);
      const stored = await transaction.getTransaction(hash);
      expect(stored.validated).to.equal(true);
    });
  });

  describe("SmartChainRevenue", () => {
    it("distributes 10% share to registered staker", async () => {
      await revenue.connect(user).registerStaker(1000);
      const fee = 1000n;
      const shareAmount = fee / 10n; // 10%
      await revenue.connect(owner).distributeRevenue(fee, { value: shareAmount });
      expect(await revenue.getPendingEarnings(user.address)).to.equal(shareAmount);
    });

    it("reverts claim with no earnings", async () => {
      await expect(revenue.connect(user).claimEarnings()).to.be.revertedWith("No earnings to claim");
    });
  });
});
