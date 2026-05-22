const { ethers } = require("hardhat");
const { expect } = require("chai");

describe("SmartChainTransaction", function () {
  let contract, owner, user1, user2;

  const txHash      = ethers.encodeBytes32String("tx-hash-001");
  const txHash2     = ethers.encodeBytes32String("tx-hash-002");
  const storageRoot = ethers.encodeBytes32String("0g-root-abc");
  const amount      = ethers.parseUnits("5000", 18);
  const fee         = ethers.parseUnits("25",   18);   // 0.5% of amount
  const savings     = ethers.parseUnits("15",   18);   // 0.3% of amount — always < fee ✓
  const route       = "0G Chain Flash Route";

  beforeEach(async function () {
    [owner, user1, user2] = await ethers.getSigners();
    const Factory = await ethers.getContractFactory("SmartChainTransaction");
    contract = await Factory.deploy();
    await contract.waitForDeployment();
  });

  // ── Deployment ────────────────────────────────────────────────────────────
  describe("Deployment", function () {
    it("sets deployer as owner", async function () {
      expect(await contract.owner()).to.equal(owner.address);
    });
    it("starts with totalOptimizations = 0", async function () {
      const [total] = await contract.getStats();
      expect(total).to.equal(0n);
    });
    it("starts with totalSavingsWei = 0", async function () {
      const [, savingsWei] = await contract.getStats();
      expect(savingsWei).to.equal(0n);
    });
  });

  // ── recordTransaction ─────────────────────────────────────────────────────
  describe("recordTransaction", function () {
    it("stores all six fields correctly", async function () {
      await contract.connect(user1).recordTransaction(txHash, amount, fee, savings, route, storageRoot);
      const tx = await contract.getTransaction(txHash);
      expect(tx.sender).to.equal(user1.address);
      expect(tx.amount).to.equal(amount);
      expect(tx.fee).to.equal(fee);
      expect(tx.savings).to.equal(savings);
      expect(tx.route).to.equal(route);
      expect(tx.storageRoot).to.equal(storageRoot);
      expect(tx.validated).to.be.false;
    });
    it("records correct block timestamp", async function () {
      const call = await contract.connect(user1).recordTransaction(txHash, amount, fee, savings, route, storageRoot);
      const blk  = await call.getBlock();
      const stored = await contract.getTransaction(txHash);
      expect(stored.timestamp).to.equal(BigInt(blk.timestamp));
    });
    it("increments totalOptimizations by 1", async function () {
      await contract.connect(user1).recordTransaction(txHash, amount, fee, savings, route, storageRoot);
      const [total] = await contract.getStats();
      expect(total).to.equal(1n);
    });
    it("accumulates totalSavingsWei", async function () {
      await contract.connect(user1).recordTransaction(txHash,  amount, fee, savings, route, storageRoot);
      await contract.connect(user1).recordTransaction(txHash2, amount, fee, savings, route, storageRoot);
      const [, savingsWei] = await contract.getStats();
      expect(savingsWei).to.equal(savings * 2n);
    });
    it("emits TransactionRecorded with correct args", async function () {
      await expect(
        contract.connect(user1).recordTransaction(txHash, amount, fee, savings, route, storageRoot)
      )
        .to.emit(contract, "TransactionRecorded")
        .withArgs(txHash, user1.address, amount, savings, storageRoot);
    });
    it("reverts on duplicate txHash", async function () {
      await contract.connect(user1).recordTransaction(txHash, amount, fee, savings, route, storageRoot);
      await expect(
        contract.connect(user1).recordTransaction(txHash, amount, fee, savings, route, storageRoot)
      ).to.be.revertedWith("Transaction already recorded");
    });
    it("reverts when savings exceed fee", async function () {
      const badSavings = fee + 1n;
      await expect(
        contract.connect(user1).recordTransaction(txHash, amount, fee, badSavings, route, storageRoot)
      ).to.be.revertedWith("Savings cannot exceed fee");
    });
    it("allows savings exactly equal to fee", async function () {
      await expect(
        contract.connect(user1).recordTransaction(txHash, amount, fee, fee, route, storageRoot)
      ).to.not.be.reverted;
    });
    it("allows zero savings", async function () {
      await expect(
        contract.connect(user1).recordTransaction(txHash, amount, fee, 0n, route, storageRoot)
      ).to.not.be.reverted;
    });
    it("allows ZeroHash as storageRoot", async function () {
      await expect(
        contract.connect(user1).recordTransaction(txHash, amount, fee, savings, route, ethers.ZeroHash)
      ).to.not.be.reverted;
      const tx = await contract.getTransaction(txHash);
      expect(tx.storageRoot).to.equal(ethers.ZeroHash);
    });
    it("different users can record different transactions", async function () {
      await contract.connect(user1).recordTransaction(txHash,  amount, fee, savings, route, storageRoot);
      await contract.connect(user2).recordTransaction(txHash2, amount, fee, savings, route, storageRoot);
      expect((await contract.getTransaction(txHash)).sender).to.equal(user1.address);
      expect((await contract.getTransaction(txHash2)).sender).to.equal(user2.address);
    });
    it("allows zero amount (fee=0, savings=0)", async function () {
      await expect(
        contract.connect(user1).recordTransaction(txHash, 0n, 0n, 0n, route, storageRoot)
      ).to.not.be.reverted;
    });
    it("accumulates correctly over 10 recordings", async function () {
      for (let i = 0; i < 10; i++) {
        const hash = ethers.encodeBytes32String(`tx-scale-${i}`);
        await contract.connect(user1).recordTransaction(hash, amount, fee, savings, route, storageRoot);
      }
      const [total, savingsWei] = await contract.getStats();
      expect(total).to.equal(10n);
      expect(savingsWei).to.equal(savings * 10n);
    });
    it("does not increment totalSavingsWei when savings = 0", async function () {
      await contract.connect(user1).recordTransaction(txHash, amount, fee, 0n, route, storageRoot);
      const [, savingsWei] = await contract.getStats();
      expect(savingsWei).to.equal(0n);
    });
  });

  // ── validateTransaction ────────────────────────────────────────────────────
  describe("validateTransaction", function () {
    beforeEach(async function () {
      await contract.connect(user1).recordTransaction(txHash, amount, fee, savings, route, storageRoot);
    });

    it("owner can validate a recorded transaction", async function () {
      await contract.connect(owner).validateTransaction(txHash);
      expect((await contract.getTransaction(txHash)).validated).to.be.true;
    });
    it("emits TransactionValidated with txHash and sender", async function () {
      await expect(contract.connect(owner).validateTransaction(txHash))
        .to.emit(contract, "TransactionValidated")
        .withArgs(txHash, user1.address);
    });
    it("non-owner cannot validate", async function () {
      await expect(contract.connect(user1).validateTransaction(txHash))
        .to.be.revertedWithCustomError(contract, "OwnableUnauthorizedAccount");
    });
    it("reverts when transaction does not exist", async function () {
      await expect(contract.connect(owner).validateTransaction(ethers.ZeroHash))
        .to.be.revertedWith("Transaction does not exist");
    });
    it("reverts on double validation", async function () {
      await contract.connect(owner).validateTransaction(txHash);
      await expect(contract.connect(owner).validateTransaction(txHash))
        .to.be.revertedWith("Already validated");
    });
    it("does not change totalOptimizations or totalSavingsWei on validate", async function () {
      const [totalBefore, savingsBefore] = await contract.getStats();
      await contract.connect(owner).validateTransaction(txHash);
      const [totalAfter, savingsAfter] = await contract.getStats();
      expect(totalAfter).to.equal(totalBefore);
      expect(savingsAfter).to.equal(savingsBefore);
    });
  });

  // ── getTransaction ─────────────────────────────────────────────────────────
  describe("getTransaction", function () {
    it("returns zero-value struct for non-existent txHash", async function () {
      const tx = await contract.getTransaction(ethers.ZeroHash);
      expect(tx.sender).to.equal(ethers.ZeroAddress);
      expect(tx.amount).to.equal(0n);
      expect(tx.validated).to.be.false;
    });
    it("returns full struct after recording", async function () {
      await contract.connect(user1).recordTransaction(txHash, amount, fee, savings, route, storageRoot);
      const tx = await contract.getTransaction(txHash);
      expect(tx.sender).to.equal(user1.address);
      expect(tx.route).to.equal(route);
    });
    it("validated field starts false and becomes true after validateTransaction", async function () {
      await contract.connect(user1).recordTransaction(txHash, amount, fee, savings, route, storageRoot);
      expect((await contract.getTransaction(txHash)).validated).to.be.false;
      await contract.connect(owner).validateTransaction(txHash);
      expect((await contract.getTransaction(txHash)).validated).to.be.true;
    });
  });

  // ── getStats ────────────────────────────────────────────────────────────────
  describe("getStats", function () {
    it("returns (0, 0) with no recordings", async function () {
      const [total, savingsWei] = await contract.getStats();
      expect(total).to.equal(0n);
      expect(savingsWei).to.equal(0n);
    });
    it("returns correct totals after recording", async function () {
      await contract.connect(user1).recordTransaction(txHash, amount, fee, savings, route, storageRoot);
      const [total, savingsWei] = await contract.getStats();
      expect(total).to.equal(1n);
      expect(savingsWei).to.equal(savings);
    });
    it("totalSavingsWei is not affected by zero-savings transactions", async function () {
      await contract.connect(user1).recordTransaction(txHash,  amount, fee, savings, route, storageRoot);
      await contract.connect(user1).recordTransaction(txHash2, amount, fee, 0n,      route, storageRoot);
      const [total, savingsWei] = await contract.getStats();
      expect(total).to.equal(2n);
      expect(savingsWei).to.equal(savings);
    });
  });
});
