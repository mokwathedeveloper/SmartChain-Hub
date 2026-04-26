const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("SmartChain Hub Contracts", function () {
  let Transaction, transaction, Revenue, revenue, owner, addr1, addr2;

  beforeEach(async function () {
    [owner, addr1, addr2] = await ethers.getSigners();

    Transaction = await ethers.getContractFactory("SmartChainTransaction");
    transaction = await Transaction.deploy();

    Revenue = await ethers.getContractFactory("SmartChainRevenue");
    revenue = await Revenue.deploy();
  });

  describe("Transaction Validation", function () {
    it("Should record a transaction and allow owner to validate", async function () {
      const txHash = ethers.id("test-tx-" + Date.now());
      const amount = ethers.parseEther("1.0");
      const fee = ethers.parseEther("0.02");
      
      await transaction.connect(addr1).recordTransaction(txHash, amount, fee, "Route A");
      
      const tx = await transaction.getTransaction(txHash);
      expect(tx.sender).to.equal(addr1.address);
      expect(tx.validated).to.equal(false);

      await transaction.validateTransaction(txHash);
      const updatedTx = await transaction.getTransaction(txHash);
      expect(updatedTx.validated).to.equal(true);
    });

    it("Should fail if non-owner tries to validate", async function () {
      const txHash = ethers.id("test-tx-2");
      await transaction.connect(addr1).recordTransaction(txHash, 1000, 5, "Route A");
      await expect(transaction.connect(addr1).validateTransaction(txHash)).to.be.reverted;
    });
  });

  describe("Revenue Sharing", function () {
    it("Should distribute revenue and allow claim", async function () {
      const fee = ethers.parseEther("1.0");
      const shareAmount = fee / 10n; // 10%

      // Register addr1 as staker
      await revenue.connect(addr1).registerStaker(1000);

      // Distribute revenue — send shareAmount as msg.value
      await revenue.connect(owner).distributeRevenue(fee, { value: shareAmount });

      const pending = await revenue.getPendingEarnings(addr1.address);
      expect(pending).to.equal(shareAmount); // addr1 has 100% stake

      const initialBalance = await ethers.provider.getBalance(addr1.address);
      await revenue.connect(addr1).claimEarnings();
      const finalBalance = await ethers.provider.getBalance(addr1.address);

      expect(finalBalance).to.be.gt(initialBalance);
    });
  });
});
