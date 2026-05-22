const { ethers } = require("hardhat");
const { expect } = require("chai");

describe("SmartChainRevenue", function () {
  let contract, owner, staker1, staker2, staker3, other;

  beforeEach(async function () {
    [owner, staker1, staker2, staker3, other] = await ethers.getSigners();
    const Factory = await ethers.getContractFactory("SmartChainRevenue");
    contract = await Factory.deploy();
    await contract.waitForDeployment();
  });

  // ── Deployment ────────────────────────────────────────────────────────────
  describe("Deployment", function () {
    it("sets deployer as owner", async function () {
      expect(await contract.owner()).to.equal(owner.address);
    });
    it("starts with totalStaked = 0", async function () {
      expect(await contract.totalStaked()).to.equal(0n);
    });
    it("starts with totalDistributed = 0", async function () {
      expect(await contract.totalDistributed()).to.equal(0n);
    });
    it("SHARE_PERCENTAGE is 10", async function () {
      expect(await contract.SHARE_PERCENTAGE()).to.equal(10n);
    });
    it("starts with getStakerCount = 0", async function () {
      expect(await contract.getStakerCount()).to.equal(0n);
    });
  });

  // ── registerStaker ─────────────────────────────────────────────────────────
  describe("registerStaker", function () {
    it("registers staker with correct stake amount", async function () {
      await contract.connect(staker1).registerStaker(1000n);
      const s = await contract.stakers(staker1.address);
      expect(s.stakeAmount).to.equal(1000n);
      expect(s.registered).to.be.true;
      expect(s.pendingEarnings).to.equal(0n);
    });
    it("increments totalStaked", async function () {
      await contract.connect(staker1).registerStaker(1000n);
      expect(await contract.totalStaked()).to.equal(1000n);
    });
    it("increments getStakerCount", async function () {
      await contract.connect(staker1).registerStaker(1000n);
      expect(await contract.getStakerCount()).to.equal(1n);
    });
    it("emits StakerRegistered event with correct args", async function () {
      await expect(contract.connect(staker1).registerStaker(1000n))
        .to.emit(contract, "StakerRegistered")
        .withArgs(staker1.address, 1000n);
    });
    it("multiple stakers register independently", async function () {
      await contract.connect(staker1).registerStaker(400n);
      await contract.connect(staker2).registerStaker(600n);
      expect(await contract.totalStaked()).to.equal(1000n);
      expect(await contract.getStakerCount()).to.equal(2n);
    });
    it("reverts on double registration by same address", async function () {
      await contract.connect(staker1).registerStaker(1000n);
      await expect(contract.connect(staker1).registerStaker(2000n))
        .to.be.revertedWith("Already registered");
    });
    it("reverts when stake amount is zero", async function () {
      await expect(contract.connect(staker1).registerStaker(0n))
        .to.be.revertedWith("Stake amount must be > 0");
    });
    it("three stakers accumulate totalStaked correctly", async function () {
      await contract.connect(staker1).registerStaker(100n);
      await contract.connect(staker2).registerStaker(200n);
      await contract.connect(staker3).registerStaker(300n);
      expect(await contract.totalStaked()).to.equal(600n);
      expect(await contract.getStakerCount()).to.equal(3n);
    });
  });

  // ── deregisterStaker ───────────────────────────────────────────────────────
  describe("deregisterStaker", function () {
    beforeEach(async function () {
      await contract.connect(staker1).registerStaker(1000n);
    });

    it("sets registered to false and stakeAmount to 0", async function () {
      await contract.connect(staker1).deregisterStaker();
      const s = await contract.stakers(staker1.address);
      expect(s.registered).to.be.false;
      expect(s.stakeAmount).to.equal(0n);
    });
    it("decrements totalStaked correctly", async function () {
      await contract.connect(staker1).deregisterStaker();
      expect(await contract.totalStaked()).to.equal(0n);
    });
    it("decrements getStakerCount", async function () {
      await contract.connect(staker1).deregisterStaker();
      expect(await contract.getStakerCount()).to.equal(0n);
    });
    it("preserves pendingEarnings after deregistration", async function () {
      // Distribute 10% of 100 ether = 10 ether to the only staker
      const totalFee    = ethers.parseEther("100");
      const shareAmount = ethers.parseEther("10");
      await contract.connect(owner).distributeRevenue(totalFee, { value: shareAmount });
      const earnings = (await contract.stakers(staker1.address)).pendingEarnings;
      await contract.connect(staker1).deregisterStaker();
      expect((await contract.stakers(staker1.address)).pendingEarnings).to.equal(earnings);
    });
    it("emits StakerDeregistered with preserved earnings = 0 when none pending", async function () {
      await expect(contract.connect(staker1).deregisterStaker())
        .to.emit(contract, "StakerDeregistered")
        .withArgs(staker1.address, 0n);
    });
    it("emits StakerDeregistered with correct preserved earnings amount", async function () {
      const totalFee    = ethers.parseEther("100");
      const shareAmount = ethers.parseEther("10");
      await contract.connect(owner).distributeRevenue(totalFee, { value: shareAmount });
      const earnings = (await contract.stakers(staker1.address)).pendingEarnings;
      await expect(contract.connect(staker1).deregisterStaker())
        .to.emit(contract, "StakerDeregistered")
        .withArgs(staker1.address, earnings);
    });
    it("reverts when caller is not registered", async function () {
      await expect(contract.connect(other).deregisterStaker())
        .to.be.revertedWith("Not registered");
    });
    it("allows re-registration after deregistration", async function () {
      await contract.connect(staker1).deregisterStaker();
      await contract.connect(staker1).registerStaker(500n);
      const s = await contract.stakers(staker1.address);
      expect(s.registered).to.be.true;
      expect(s.stakeAmount).to.equal(500n);
    });
    it("removing one of two stakers updates totalStaked correctly", async function () {
      await contract.connect(staker2).registerStaker(300n);
      await contract.connect(staker1).deregisterStaker();
      expect(await contract.totalStaked()).to.equal(300n);
      expect(await contract.getStakerCount()).to.equal(1n);
    });
  });

  // ── distributeRevenue ──────────────────────────────────────────────────────
  describe("distributeRevenue", function () {
    // staker1 = 1000 weight, staker2 = 3000 weight, total = 4000
    // shareAmount = totalFee * 10% → e.g. totalFee=1000, shareAmount=100
    // staker1 gets (1000/4000)*100 = 25, staker2 gets (3000/4000)*100 = 75
    beforeEach(async function () {
      await contract.connect(staker1).registerStaker(1000n);
      await contract.connect(staker2).registerStaker(3000n);
    });

    it("distributes proportionally between two stakers", async function () {
      await contract.connect(owner).distributeRevenue(1000n, { value: 100n });
      expect(await contract.getPendingEarnings(staker1.address)).to.equal(25n);
      expect(await contract.getPendingEarnings(staker2.address)).to.equal(75n);
    });
    it("accumulates totalDistributed", async function () {
      await contract.connect(owner).distributeRevenue(1000n, { value: 100n });
      expect(await contract.totalDistributed()).to.equal(100n);
    });
    it("emits RevenueDistributed with correct args", async function () {
      await expect(contract.connect(owner).distributeRevenue(1000n, { value: 100n }))
        .to.emit(contract, "RevenueDistributed")
        .withArgs(1000n, 100n, 2n);
    });
    it("earnings accumulate correctly over multiple distributions", async function () {
      await contract.connect(owner).distributeRevenue(1000n, { value: 100n });
      await contract.connect(owner).distributeRevenue(1000n, { value: 100n });
      expect(await contract.getPendingEarnings(staker1.address)).to.equal(50n);
      expect(await contract.getPendingEarnings(staker2.address)).to.equal(150n);
    });
    it("handles equal-stake two-staker split without dust", async function () {
      const Factory = await ethers.getContractFactory("SmartChainRevenue");
      const c2 = await Factory.deploy();
      await c2.waitForDeployment();
      await c2.connect(staker1).registerStaker(500n);
      await c2.connect(staker2).registerStaker(500n);
      // totalFee=2000, shareAmount=200, each gets 100
      await c2.connect(owner).distributeRevenue(2000n, { value: 200n });
      expect(await c2.getPendingEarnings(staker1.address)).to.equal(100n);
      expect(await c2.getPendingEarnings(staker2.address)).to.equal(100n);
    });
    it("emits DustRefunded and refunds rounding dust to owner", async function () {
      // 3 stakers each weight 1, totalStaked=3, shareAmount=10
      // each gets floor(1/3 * 10) = 3, total=9, dust=1
      const Factory = await ethers.getContractFactory("SmartChainRevenue");
      const c2 = await Factory.deploy();
      await c2.waitForDeployment();
      await c2.connect(staker1).registerStaker(1n);
      await c2.connect(staker2).registerStaker(1n);
      await c2.connect(staker3).registerStaker(1n);
      await expect(c2.connect(owner).distributeRevenue(100n, { value: 10n }))
        .to.emit(c2, "DustRefunded")
        .withArgs(owner.address, 1n);
    });
    it("reverts when msg.value is less than shareAmount", async function () {
      await expect(
        contract.connect(owner).distributeRevenue(1000n, { value: 99n })
      ).to.be.revertedWith("Insufficient ETH sent for distribution");
    });
    it("reverts when no stakers are registered", async function () {
      const Factory = await ethers.getContractFactory("SmartChainRevenue");
      const c2 = await Factory.deploy();
      await c2.waitForDeployment();
      await expect(
        c2.connect(owner).distributeRevenue(1000n, { value: 100n })
      ).to.be.revertedWith("No stakers registered");
    });
    it("non-owner cannot call distributeRevenue", async function () {
      await expect(
        contract.connect(staker1).distributeRevenue(1000n, { value: 100n })
      ).to.be.revertedWithCustomError(contract, "OwnableUnauthorizedAccount");
    });
    it("single staker receives full shareAmount", async function () {
      const Factory = await ethers.getContractFactory("SmartChainRevenue");
      const c2 = await Factory.deploy();
      await c2.waitForDeployment();
      await c2.connect(staker1).registerStaker(1000n);
      // totalFee=500, shareAmount=50, staker1 gets (1000/1000)*50 = 50
      await c2.connect(owner).distributeRevenue(500n, { value: 50n });
      expect(await c2.getPendingEarnings(staker1.address)).to.equal(50n);
    });
    it("excess msg.value above shareAmount is returned as dust", async function () {
      const Factory = await ethers.getContractFactory("SmartChainRevenue");
      const c2 = await Factory.deploy();
      await c2.waitForDeployment();
      await c2.connect(staker1).registerStaker(1000n);
      // Send more than needed: totalFee=100, shareAmount=10, but send 15 → dust = 5
      const before = await ethers.provider.getBalance(owner.address);
      const tx     = await c2.connect(owner).distributeRevenue(100n, { value: 15n });
      const rcpt   = await tx.wait();
      const gas    = rcpt.gasUsed * rcpt.gasPrice;
      const after  = await ethers.provider.getBalance(owner.address);
      // owner paid 15n + gas, got 5n back → net spent = 10n + gas
      expect(before - after - gas).to.equal(10n);
    });
  });

  // ── claimEarnings ──────────────────────────────────────────────────────────
  describe("claimEarnings", function () {
    beforeEach(async function () {
      await contract.connect(staker1).registerStaker(1000n);
    });

    it("transfers pendingEarnings to staker (real ETH)", async function () {
      const totalFee    = ethers.parseEther("100");
      const shareAmount = ethers.parseEther("10");
      await contract.connect(owner).distributeRevenue(totalFee, { value: shareAmount });
      const expected = await contract.getPendingEarnings(staker1.address);
      const before   = await ethers.provider.getBalance(staker1.address);
      const tx       = await contract.connect(staker1).claimEarnings();
      const rcpt     = await tx.wait();
      const gas      = rcpt.gasUsed * rcpt.gasPrice;
      const after    = await ethers.provider.getBalance(staker1.address);
      expect(after - before + gas).to.equal(expected);
    });
    it("sets pendingEarnings to 0 after claim", async function () {
      const totalFee    = ethers.parseEther("100");
      const shareAmount = ethers.parseEther("10");
      await contract.connect(owner).distributeRevenue(totalFee, { value: shareAmount });
      await contract.connect(staker1).claimEarnings();
      expect(await contract.getPendingEarnings(staker1.address)).to.equal(0n);
    });
    it("emits EarningsClaimed with correct args", async function () {
      const totalFee    = ethers.parseEther("100");
      const shareAmount = ethers.parseEther("10");
      await contract.connect(owner).distributeRevenue(totalFee, { value: shareAmount });
      const expected = await contract.getPendingEarnings(staker1.address);
      await expect(contract.connect(staker1).claimEarnings())
        .to.emit(contract, "EarningsClaimed")
        .withArgs(staker1.address, expected);
    });
    it("reverts when no earnings to claim", async function () {
      await expect(contract.connect(staker1).claimEarnings())
        .to.be.revertedWith("No earnings to claim");
    });
    it("reverts for address with no earnings at all", async function () {
      await expect(contract.connect(other).claimEarnings())
        .to.be.revertedWith("No earnings to claim");
    });
    it("deregistered staker can still claim preserved pending earnings", async function () {
      const totalFee    = ethers.parseEther("100");
      const shareAmount = ethers.parseEther("10");
      await contract.connect(owner).distributeRevenue(totalFee, { value: shareAmount });
      const expected = await contract.getPendingEarnings(staker1.address);
      await contract.connect(staker1).deregisterStaker();
      const before  = await ethers.provider.getBalance(staker1.address);
      const tx      = await contract.connect(staker1).claimEarnings();
      const rcpt    = await tx.wait();
      const gas     = rcpt.gasUsed * rcpt.gasPrice;
      const after   = await ethers.provider.getBalance(staker1.address);
      expect(after - before + gas).to.equal(expected);
    });
    it("cannot double-claim earnings", async function () {
      const totalFee    = ethers.parseEther("100");
      const shareAmount = ethers.parseEther("10");
      await contract.connect(owner).distributeRevenue(totalFee, { value: shareAmount });
      await contract.connect(staker1).claimEarnings();
      await expect(contract.connect(staker1).claimEarnings())
        .to.be.revertedWith("No earnings to claim");
    });
  });

  // ── getPendingEarnings / getStakerCount ────────────────────────────────────
  describe("views", function () {
    it("getPendingEarnings returns 0 for non-registered address", async function () {
      expect(await contract.getPendingEarnings(other.address)).to.equal(0n);
    });
    it("getPendingEarnings returns 0 for registered staker before any distribution", async function () {
      await contract.connect(staker1).registerStaker(1000n);
      expect(await contract.getPendingEarnings(staker1.address)).to.equal(0n);
    });
    it("getStakerCount increments per registration and decrements per deregistration", async function () {
      expect(await contract.getStakerCount()).to.equal(0n);
      await contract.connect(staker1).registerStaker(100n);
      expect(await contract.getStakerCount()).to.equal(1n);
      await contract.connect(staker2).registerStaker(200n);
      expect(await contract.getStakerCount()).to.equal(2n);
      await contract.connect(staker1).deregisterStaker();
      expect(await contract.getStakerCount()).to.equal(1n);
    });
  });

  // ── Revenue at scale ───────────────────────────────────────────────────────
  describe("Revenue at scale", function () {
    it("handles 10 consecutive distributions with equal-stake stakers", async function () {
      await contract.connect(staker1).registerStaker(500n);
      await contract.connect(staker2).registerStaker(500n);
      // Each call: totalFee=1000, shareAmount=100, each gets 50
      for (let i = 0; i < 10; i++) {
        await contract.connect(owner).distributeRevenue(1000n, { value: 100n });
      }
      expect(await contract.getPendingEarnings(staker1.address)).to.equal(500n);
      expect(await contract.getPendingEarnings(staker2.address)).to.equal(500n);
      expect(await contract.totalDistributed()).to.equal(1000n);
    });
    it("proportional distribution remains consistent over 5 rounds", async function () {
      await contract.connect(staker1).registerStaker(1000n);
      await contract.connect(staker2).registerStaker(3000n);
      // staker1 gets 25/round, staker2 gets 75/round
      for (let i = 0; i < 5; i++) {
        await contract.connect(owner).distributeRevenue(1000n, { value: 100n });
      }
      expect(await contract.getPendingEarnings(staker1.address)).to.equal(125n);
      expect(await contract.getPendingEarnings(staker2.address)).to.equal(375n);
    });
  });
});
