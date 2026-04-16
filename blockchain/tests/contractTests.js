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
      await transaction.connect(user).recordTransaction(hash, ethers.parseUnits("100", 18), ethers.parseUnits("0.5", 18), "0G Flash");
      const stored = await transaction.getTransaction(hash);
      expect(stored.sender).to.equal(user.address);
      expect(stored.validated).to.equal(false);
    });

    it("reverts on duplicate hash", async () => {
      const hash = ethers.id("test-tx-dup");
      await transaction.connect(user).recordTransaction(hash, 100n, 1n, "route");
      await expect(transaction.connect(user).recordTransaction(hash, 100n, 1n, "route")).to.be.revertedWith("Transaction already exists");
    });

    it("owner can validate", async () => {
      const hash = ethers.id("test-tx-val");
      await transaction.connect(user).recordTransaction(hash, 100n, 1n, "route");
      await transaction.connect(owner).validateTransaction(hash);
      const stored = await transaction.getTransaction(hash);
      expect(stored.validated).to.equal(true);
    });
  });

  describe("SmartChainRevenue", () => {
    it("distributes 10% share", async () => {
      await revenue.connect(owner).distributeRevenue(user.address, 1000n);
      expect(await revenue.pendingEarnings(user.address)).to.equal(100n);
    });

    it("reverts claim with no earnings", async () => {
      await expect(revenue.connect(user).claimEarnings()).to.be.revertedWith("No earnings to claim");
    });
  });
});
