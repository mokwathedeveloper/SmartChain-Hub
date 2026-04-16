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
      
      // Send some ether to the contract for distribution
      await owner.sendTransaction({ 
        to: await revenue.getAddress(), 
        value: fee 
      });
      
      await revenue.distributeRevenue(addr1.address, fee);
      const pending = await revenue.pendingEarnings(addr1.address);
      expect(pending).to.equal(ethers.parseEther("0.1")); // 10%

      const initialBalance = await ethers.provider.getBalance(addr1.address);
      await revenue.connect(addr1).claimEarnings();
      const finalBalance = await ethers.provider.getBalance(addr1.address);
      
      expect(finalBalance).to.be.gt(initialBalance);
    });
  });
});
