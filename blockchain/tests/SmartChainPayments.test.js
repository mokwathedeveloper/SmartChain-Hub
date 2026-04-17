const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("SmartChainPayments", function () {
  let payments, owner, alice, bob;

  beforeEach(async () => {
    [owner, alice, bob] = await ethers.getSigners();
    const P = await ethers.getContractFactory("SmartChainPayments");
    payments = await P.deploy();
  });

  // ── Send funds ──────────────────────────────────────────────────
  describe("sendFunds", () => {
    it("transfers net amount to recipient", async () => {
      const send = ethers.parseEther("1.0");
      const fee = send * 5n / 1000n;       // 0.5%
      const net = send - fee;
      const before = await ethers.provider.getBalance(bob.address);
      await payments.connect(alice).sendFunds(bob.address, "test", { value: send });
      const after = await ethers.provider.getBalance(bob.address);
      expect(after - before).to.equal(net);
    });

    it("records payment in history", async () => {
      await payments.connect(alice).sendFunds(bob.address, "hello", { value: ethers.parseEther("0.5") });
      expect(await payments.getPaymentCount()).to.equal(1);
      expect(await payments.getSentCount(alice.address)).to.equal(1);
      expect(await payments.getReceivedCount(bob.address)).to.equal(1);
    });

    it("emits FundsSent event", async () => {
      const val = ethers.parseEther("1.0");
      await expect(payments.connect(alice).sendFunds(bob.address, "memo", { value: val }))
        .to.emit(payments, "FundsSent");
    });

    it("reverts with zero value", async () => {
      await expect(payments.connect(alice).sendFunds(bob.address, "", { value: 0 }))
        .to.be.revertedWith("Amount required");
    });

    it("reverts with zero address", async () => {
      await expect(payments.connect(alice).sendFunds(ethers.ZeroAddress, "", { value: ethers.parseEther("1") }))
        .to.be.revertedWith("Invalid recipient");
    });
  });

  // ── Staking ─────────────────────────────────────────────────────
  describe("stake / unstake", () => {
    it("records stake amount", async () => {
      await payments.connect(alice).stake({ value: ethers.parseEther("2.0") });
      const [amt] = await payments.getStake(alice.address);
      expect(amt).to.equal(ethers.parseEther("2.0"));
      expect(await payments.totalStaked()).to.equal(ethers.parseEther("2.0"));
    });

    it("emits Staked event", async () => {
      await expect(payments.connect(alice).stake({ value: ethers.parseEther("1.0") }))
        .to.emit(payments, "Staked").withArgs(alice.address, ethers.parseEther("1.0"));
    });

    it("unstake returns principal", async () => {
      const stakeAmt = ethers.parseEther("1.0");
      await payments.connect(alice).stake({ value: stakeAmt });
      // Contract already holds the staked ETH, so unstake should work
      const before = await ethers.provider.getBalance(alice.address);
      const tx = await payments.connect(alice).unstake();
      const receipt = await tx.wait();
      const gasCost = receipt.gasUsed * tx.gasPrice;
      const after = await ethers.provider.getBalance(alice.address);
      // Should get back at least 99% of principal (minus gas)
      expect(after + gasCost).to.be.gte(before + stakeAmt * 99n / 100n);
    });

    it("reverts unstake with nothing staked", async () => {
      await expect(payments.connect(alice).unstake()).to.be.revertedWith("Nothing staked");
    });

    it("reverts stake with zero value", async () => {
      await expect(payments.connect(alice).stake({ value: 0 })).to.be.revertedWith("Stake amount required");
    });
  });

  // ── Revenue sharing ─────────────────────────────────────────────
  describe("distributeRevenue / claimEarnings", () => {
    it("owner can distribute revenue", async () => {
      await owner.sendTransaction({ to: await payments.getAddress(), value: ethers.parseEther("1.0") });
      await payments.connect(owner).distributeRevenue(alice.address, ethers.parseEther("0.5"));
      expect(await payments.pendingEarnings(alice.address)).to.equal(ethers.parseEther("0.5"));
    });

    it("non-owner cannot distribute", async () => {
      await expect(payments.connect(alice).distributeRevenue(bob.address, 100n))
        .to.be.revertedWithCustomError(payments, "OwnableUnauthorizedAccount");
    });

    it("claimEarnings transfers to caller", async () => {
      await owner.sendTransaction({ to: await payments.getAddress(), value: ethers.parseEther("1.0") });
      await payments.connect(owner).distributeRevenue(alice.address, ethers.parseEther("0.5"));
      const before = await ethers.provider.getBalance(alice.address);
      const tx = await payments.connect(alice).claimEarnings();
      const receipt = await tx.wait();
      const gasCost = receipt.gasUsed * tx.gasPrice;
      const after = await ethers.provider.getBalance(alice.address);
      expect(after + gasCost).to.be.gt(before);
      expect(await payments.pendingEarnings(alice.address)).to.equal(0n);
    });

    it("reverts claim with no earnings", async () => {
      await expect(payments.connect(alice).claimEarnings()).to.be.revertedWith("No earnings to claim");
    });
  });
});
