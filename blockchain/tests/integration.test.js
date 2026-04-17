const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Integration & Exploratory Tests", function () {
  let tx, revenue, payments, owner, alice, bob;

  beforeEach(async () => {
    [owner, alice, bob] = await ethers.getSigners();
    tx = await (await ethers.getContractFactory("SmartChainTransaction")).deploy();
    revenue = await (await ethers.getContractFactory("SmartChainRevenue")).deploy();
    payments = await (await ethers.getContractFactory("SmartChainPayments")).deploy();
  });

  // ── Integration: Transaction + Revenue flow ──────────────────
  describe("Transaction → Revenue integration", () => {
    it("records tx then distributes revenue from fee", async () => {
      const hash = ethers.id("integration-1");
      await tx.connect(alice).recordTransaction(hash, ethers.parseEther("100"), ethers.parseEther("1"), "0G Flash");
      await tx.connect(owner).validateTransaction(hash);
      const stored = await tx.getTransaction(hash);
      expect(stored.validated).to.equal(true);

      // Distribute 10% of fee to alice — revenue contract takes 10% of _totalFee
      await owner.sendTransaction({ to: await revenue.getAddress(), value: ethers.parseEther("0.1") });
      await revenue.connect(owner).distributeRevenue(alice.address, ethers.parseEther("0.1"));
      // distributeRevenue stores 10% of _totalFee = 0.1 * 10% = 0.01 ETH
      expect(await revenue.pendingEarnings(alice.address)).to.equal(ethers.parseEther("0.01"));
    });
  });

  // ── Integration: Payments → Stake → Claim flow ───────────────
  describe("Send → Stake → Claim flow", () => {
    it("full payment lifecycle", async () => {
      // Alice sends to Bob
      await payments.connect(alice).sendFunds(bob.address, "payment", { value: ethers.parseEther("2.0") });
      expect(await payments.getPaymentCount()).to.equal(1);

      // Alice stakes
      await payments.connect(alice).stake({ value: ethers.parseEther("1.0") });
      const [staked] = await payments.getStake(alice.address);
      expect(staked).to.equal(ethers.parseEther("1.0"));

      // Owner distributes revenue to alice
      await owner.sendTransaction({ to: await payments.getAddress(), value: ethers.parseEther("0.5") });
      await payments.connect(owner).distributeRevenue(alice.address, ethers.parseEther("0.2"));
      expect(await payments.pendingEarnings(alice.address)).to.equal(ethers.parseEther("0.2"));

      // Alice claims
      await payments.connect(alice).claimEarnings();
      expect(await payments.pendingEarnings(alice.address)).to.equal(0n);
    });
  });

  // ── Exploratory: Boundary conditions ─────────────────────────
  describe("Boundary conditions", () => {
    it("handles minimum send amount (1 wei)", async () => {
      await expect(payments.connect(alice).sendFunds(bob.address, "", { value: 1n }))
        .to.not.be.reverted;
    });

    it("multiple stakes accumulate correctly", async () => {
      await payments.connect(alice).stake({ value: ethers.parseEther("1.0") });
      await payments.connect(alice).stake({ value: ethers.parseEther("2.0") });
      const [staked] = await payments.getStake(alice.address);
      expect(staked).to.equal(ethers.parseEther("3.0"));
    });

    it("multiple payments tracked independently", async () => {
      await payments.connect(alice).sendFunds(bob.address, "p1", { value: ethers.parseEther("0.1") });
      await payments.connect(alice).sendFunds(bob.address, "p2", { value: ethers.parseEther("0.2") });
      await payments.connect(bob).sendFunds(alice.address, "p3", { value: ethers.parseEther("0.3") });
      expect(await payments.getPaymentCount()).to.equal(3);
      expect(await payments.getSentCount(alice.address)).to.equal(2);
      expect(await payments.getSentCount(bob.address)).to.equal(1);
    });

    it("duplicate tx hash reverts", async () => {
      const hash = ethers.id("dup");
      await tx.connect(alice).recordTransaction(hash, 100n, 1n, "route");
      await expect(tx.connect(alice).recordTransaction(hash, 100n, 1n, "route"))
        .to.be.revertedWith("Transaction already exists");
    });

    it("validate non-existent tx reverts", async () => {
      const hash = ethers.id("nonexistent");
      await expect(tx.connect(owner).validateTransaction(hash))
        .to.be.revertedWith("Transaction does not exist");
    });

    it("double validate reverts", async () => {
      const hash = ethers.id("double-val");
      await tx.connect(alice).recordTransaction(hash, 100n, 1n, "route");
      await tx.connect(owner).validateTransaction(hash);
      await expect(tx.connect(owner).validateTransaction(hash))
        .to.be.revertedWith("Already validated");
    });

    it("revenue share percentage is exactly 10%", async () => {
      await revenue.connect(owner).distributeRevenue(alice.address, 1000n);
      expect(await revenue.pendingEarnings(alice.address)).to.equal(100n);
    });

    it("0.5% fee deducted on sendFunds", async () => {
      const amount = ethers.parseEther("1.0");
      const expectedFee = amount * 5n / 1000n;
      const expectedNet = amount - expectedFee;
      const before = await ethers.provider.getBalance(bob.address);
      await payments.connect(alice).sendFunds(bob.address, "", { value: amount });
      const after = await ethers.provider.getBalance(bob.address);
      expect(after - before).to.equal(expectedNet);
    });
  });

  // ── Exploratory: Reentrancy protection ───────────────────────
  describe("Security", () => {
    it("claimEarnings resets balance before transfer (reentrancy safe)", async () => {
      await owner.sendTransaction({ to: await payments.getAddress(), value: ethers.parseEther("1.0") });
      await payments.connect(owner).distributeRevenue(alice.address, ethers.parseEther("0.5"));
      await payments.connect(alice).claimEarnings();
      // Second claim should revert
      await expect(payments.connect(alice).claimEarnings()).to.be.revertedWith("No earnings to claim");
    });

    it("non-owner cannot validate transactions", async () => {
      const hash = ethers.id("sec-1");
      await tx.connect(alice).recordTransaction(hash, 100n, 1n, "route");
      await expect(tx.connect(alice).validateTransaction(hash))
        .to.be.revertedWithCustomError(tx, "OwnableUnauthorizedAccount");
    });
  });
});
