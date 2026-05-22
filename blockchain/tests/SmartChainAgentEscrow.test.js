const { ethers } = require("hardhat");
const { expect } = require("chai");

describe("SmartChainAgentEscrow", function () {
  let contract, owner, agentA, agentB, agentC, other;
  const pricePerCall = ethers.parseEther("0.01");
  const deposit1     = ethers.parseEther("0.5");
  const deposit2     = ethers.parseEther("1.0");

  beforeEach(async function () {
    [owner, agentA, agentB, agentC, other] = await ethers.getSigners();
    const Factory = await ethers.getContractFactory("SmartChainAgentEscrow");
    contract = await Factory.deploy();
    await contract.waitForDeployment();
  });

  // ── Constants ─────────────────────────────────────────────────────────────
  describe("Constants", function () {
    it("PLATFORM_FEE_BPS is 100 (1%)", async function () {
      expect(await contract.PLATFORM_FEE_BPS()).to.equal(100n);
    });
    it("MAX_CHANNEL_DEPOSIT is 100 ether", async function () {
      expect(await contract.MAX_CHANNEL_DEPOSIT()).to.equal(ethers.parseEther("100"));
    });
    it("starts with totalFeesCollected = 0", async function () {
      expect(await contract.totalFeesCollected()).to.equal(0n);
    });
  });

  // ── channelId ─────────────────────────────────────────────────────────────
  describe("channelId", function () {
    it("returns deterministic id for the same pair", async function () {
      const id1 = await contract.channelId(agentA.address, agentB.address);
      const id2 = await contract.channelId(agentA.address, agentB.address);
      expect(id1).to.equal(id2);
    });
    it("returns different ids for reversed pairs", async function () {
      const ab = await contract.channelId(agentA.address, agentB.address);
      const ba = await contract.channelId(agentB.address, agentA.address);
      expect(ab).to.not.equal(ba);
    });
    it("matches keccak256(abi.encodePacked(A, B))", async function () {
      const expected = ethers.solidityPackedKeccak256(
        ["address", "address"],
        [agentA.address, agentB.address]
      );
      expect(await contract.channelId(agentA.address, agentB.address)).to.equal(expected);
    });
  });

  // ── deposit ───────────────────────────────────────────────────────────────
  describe("deposit", function () {
    it("creates channel with correct fields on first deposit", async function () {
      await contract.connect(agentA).deposit(agentB.address, pricePerCall, { value: deposit1 });
      const ch = await contract.getChannel(agentA.address, agentB.address);
      expect(ch.agentA).to.equal(agentA.address);
      expect(ch.agentB).to.equal(agentB.address);
      expect(ch.balance).to.equal(deposit1);
      expect(ch.pricePerCall).to.equal(pricePerCall);
      expect(ch.active).to.be.true;
      expect(ch.totalCalls).to.equal(0n);
      expect(ch.totalPaid).to.equal(0n);
    });
    it("emits ChannelOpened on first deposit", async function () {
      const cid = await contract.channelId(agentA.address, agentB.address);
      await expect(
        contract.connect(agentA).deposit(agentB.address, pricePerCall, { value: deposit1 })
      )
        .to.emit(contract, "ChannelOpened")
        .withArgs(cid, agentA.address, agentB.address, pricePerCall);
    });
    it("emits ChannelToppedUp on first deposit", async function () {
      const cid = await contract.channelId(agentA.address, agentB.address);
      await expect(
        contract.connect(agentA).deposit(agentB.address, pricePerCall, { value: deposit1 })
      )
        .to.emit(contract, "ChannelToppedUp")
        .withArgs(cid, deposit1, deposit1);
    });
    it("tops up existing channel and increases balance", async function () {
      await contract.connect(agentA).deposit(agentB.address, pricePerCall, { value: deposit1 });
      await contract.connect(agentA).deposit(agentB.address, pricePerCall, { value: deposit1 });
      const ch = await contract.getChannel(agentA.address, agentB.address);
      expect(ch.balance).to.equal(deposit1 * 2n);
    });
    it("does NOT re-emit ChannelOpened on top-up", async function () {
      await contract.connect(agentA).deposit(agentB.address, pricePerCall, { value: deposit1 });
      await expect(
        contract.connect(agentA).deposit(agentB.address, pricePerCall, { value: deposit1 })
      ).to.not.emit(contract, "ChannelOpened");
    });
    it("pricePerCall is not changed on subsequent deposits", async function () {
      const newPrice = ethers.parseEther("0.1");
      await contract.connect(agentA).deposit(agentB.address, pricePerCall, { value: deposit1 });
      await contract.connect(agentA).deposit(agentB.address, newPrice,     { value: deposit1 });
      const ch = await contract.getChannel(agentA.address, agentB.address);
      expect(ch.pricePerCall).to.equal(pricePerCall);
    });
    it("registers channel for both agentA and agentB", async function () {
      await contract.connect(agentA).deposit(agentB.address, pricePerCall, { value: deposit1 });
      expect(await contract.getAgentChannelCount(agentA.address)).to.equal(1n);
      expect(await contract.getAgentChannelCount(agentB.address)).to.equal(1n);
    });
    it("agentA can open multiple channels with different counterparties", async function () {
      await contract.connect(agentA).deposit(agentB.address, pricePerCall, { value: deposit1 });
      await contract.connect(agentA).deposit(agentC.address, pricePerCall, { value: deposit1 });
      expect(await contract.getAgentChannelCount(agentA.address)).to.equal(2n);
    });
    it("reverts when msg.value is zero", async function () {
      await expect(
        contract.connect(agentA).deposit(agentB.address, pricePerCall, { value: 0 })
      ).to.be.revertedWith("Deposit amount required");
    });
    it("reverts when agentB is zero address", async function () {
      await expect(
        contract.connect(agentA).deposit(ethers.ZeroAddress, pricePerCall, { value: deposit1 })
      ).to.be.revertedWith("Invalid agent B address");
    });
    it("reverts when agentB is the caller (self-channel)", async function () {
      await expect(
        contract.connect(agentA).deposit(agentA.address, pricePerCall, { value: deposit1 })
      ).to.be.revertedWith("Cannot open channel with yourself");
    });
    it("reverts when pricePerCall is zero", async function () {
      await expect(
        contract.connect(agentA).deposit(agentB.address, 0n, { value: deposit1 })
      ).to.be.revertedWith("Price per call must be > 0");
    });
    it("reverts when deposit would exceed MAX_CHANNEL_DEPOSIT", async function () {
      const over = ethers.parseEther("101");
      await expect(
        contract.connect(agentA).deposit(agentB.address, pricePerCall, { value: over })
      ).to.be.revertedWith("Exceeds max channel deposit");
    });
    it("reverts when top-up would push balance over MAX_CHANNEL_DEPOSIT", async function () {
      const big = ethers.parseEther("60");
      await contract.connect(agentA).deposit(agentB.address, pricePerCall, { value: big });
      await expect(
        contract.connect(agentA).deposit(agentB.address, pricePerCall, { value: big })
      ).to.be.revertedWith("Exceeds max channel deposit");
    });
  });

  // ── payPerCall ────────────────────────────────────────────────────────────
  describe("payPerCall", function () {
    beforeEach(async function () {
      await contract.connect(agentA).deposit(agentB.address, pricePerCall, { value: deposit2 });
    });

    it("transfers 99% of pricePerCall to agentB", async function () {
      const fee    = pricePerCall / 100n;
      const net    = pricePerCall - fee;
      const before = await ethers.provider.getBalance(agentB.address);
      const tx     = await contract.connect(agentB).payPerCall(agentA.address);
      const rcpt   = await tx.wait();
      const gas    = rcpt.gasUsed * rcpt.gasPrice;
      const after  = await ethers.provider.getBalance(agentB.address);
      expect(after - before + gas).to.equal(net);
    });
    it("deducts full pricePerCall from channel balance", async function () {
      await contract.connect(agentB).payPerCall(agentA.address);
      const ch = await contract.getChannel(agentA.address, agentB.address);
      expect(ch.balance).to.equal(deposit2 - pricePerCall);
    });
    it("increments totalCalls by 1", async function () {
      await contract.connect(agentB).payPerCall(agentA.address);
      const ch = await contract.getChannel(agentA.address, agentB.address);
      expect(ch.totalCalls).to.equal(1n);
    });
    it("accumulates totalCalls over multiple calls", async function () {
      await contract.connect(agentB).payPerCall(agentA.address);
      await contract.connect(agentB).payPerCall(agentA.address);
      await contract.connect(agentB).payPerCall(agentA.address);
      const ch = await contract.getChannel(agentA.address, agentB.address);
      expect(ch.totalCalls).to.equal(3n);
    });
    it("accumulates totalPaid correctly (net per call)", async function () {
      const fee = pricePerCall / 100n;
      const net = pricePerCall - fee;
      await contract.connect(agentB).payPerCall(agentA.address);
      await contract.connect(agentB).payPerCall(agentA.address);
      const ch = await contract.getChannel(agentA.address, agentB.address);
      expect(ch.totalPaid).to.equal(net * 2n);
    });
    it("accumulates totalFeesCollected with 1% per call", async function () {
      const fee = pricePerCall / 100n;
      await contract.connect(agentB).payPerCall(agentA.address);
      expect(await contract.totalFeesCollected()).to.equal(fee);
      await contract.connect(agentB).payPerCall(agentA.address);
      expect(await contract.totalFeesCollected()).to.equal(fee * 2n);
    });
    it("emits CallSettled with correct args", async function () {
      const cid = await contract.channelId(agentA.address, agentB.address);
      const fee = pricePerCall / 100n;
      const net = pricePerCall - fee;
      await expect(contract.connect(agentB).payPerCall(agentA.address))
        .to.emit(contract, "CallSettled")
        .withArgs(cid, agentB.address, net, 1n);
    });
    it("reverts when channel is not active (no channel exists for pair)", async function () {
      await expect(contract.connect(agentC).payPerCall(agentA.address))
        .to.be.revertedWith("Channel not active");
    });
    it("reverts when channel balance is less than pricePerCall", async function () {
      // Open a channel with only half a call's worth
      const half = pricePerCall / 2n;
      await contract.connect(agentA).deposit(agentC.address, pricePerCall, { value: half });
      await expect(contract.connect(agentC).payPerCall(agentA.address))
        .to.be.revertedWith("Insufficient channel balance");
    });
    it("can settle exactly until balance is drained", async function () {
      // deposit2 = 1 ether, pricePerCall = 0.01 ether → 100 calls fit
      const calls = deposit2 / pricePerCall;
      for (let i = 0n; i < calls; i++) {
        await contract.connect(agentB).payPerCall(agentA.address);
      }
      const ch = await contract.getChannel(agentA.address, agentB.address);
      expect(ch.balance).to.equal(0n);
      expect(ch.totalCalls).to.equal(calls);
    });
  });

  // ── withdraw ──────────────────────────────────────────────────────────────
  describe("withdraw", function () {
    beforeEach(async function () {
      await contract.connect(agentA).deposit(agentB.address, pricePerCall, { value: deposit1 });
    });

    it("returns full remaining balance to agentA", async function () {
      const before  = await ethers.provider.getBalance(agentA.address);
      const tx      = await contract.connect(agentA).withdraw(agentB.address);
      const rcpt    = await tx.wait();
      const gas     = rcpt.gasUsed * rcpt.gasPrice;
      const after   = await ethers.provider.getBalance(agentA.address);
      expect(after - before + gas).to.equal(deposit1);
    });
    it("sets channel balance to 0 and active to false", async function () {
      await contract.connect(agentA).withdraw(agentB.address);
      const ch = await contract.getChannel(agentA.address, agentB.address);
      expect(ch.balance).to.equal(0n);
      expect(ch.active).to.be.false;
    });
    it("emits ChannelWithdrawn with correct args", async function () {
      const cid = await contract.channelId(agentA.address, agentB.address);
      await expect(contract.connect(agentA).withdraw(agentB.address))
        .to.emit(contract, "ChannelWithdrawn")
        .withArgs(cid, agentA.address, deposit1);
    });
    it("emits ChannelClosed", async function () {
      const cid = await contract.channelId(agentA.address, agentB.address);
      await expect(contract.connect(agentA).withdraw(agentB.address))
        .to.emit(contract, "ChannelClosed")
        .withArgs(cid);
    });
    it("returns partial balance when some calls already settled", async function () {
      await contract.connect(agentB).payPerCall(agentA.address);
      const expected = deposit1 - pricePerCall;
      const before   = await ethers.provider.getBalance(agentA.address);
      const tx       = await contract.connect(agentA).withdraw(agentB.address);
      const rcpt     = await tx.wait();
      const gas      = rcpt.gasUsed * rcpt.gasPrice;
      const after    = await ethers.provider.getBalance(agentA.address);
      expect(after - before + gas).to.equal(expected);
    });
    it("reverts when channel is not active (closed or never opened)", async function () {
      await contract.connect(agentA).withdraw(agentB.address);
      await expect(contract.connect(agentA).withdraw(agentB.address))
        .to.be.revertedWith("Channel not active");
    });
    it("reverts when balance is zero after all calls drained", async function () {
      // Open fresh channel with exactly 1 call worth
      await contract.connect(agentA).deposit(agentC.address, pricePerCall, { value: pricePerCall });
      await contract.connect(agentC).payPerCall(agentA.address);
      await expect(contract.connect(agentA).withdraw(agentC.address))
        .to.be.revertedWith("Nothing to withdraw");
    });
  });

  // ── collectFees ────────────────────────────────────────────────────────────
  describe("collectFees", function () {
    beforeEach(async function () {
      await contract.connect(agentA).deposit(agentB.address, pricePerCall, { value: deposit2 });
      await contract.connect(agentB).payPerCall(agentA.address);
    });

    it("owner receives accumulated platform fees", async function () {
      const fee    = pricePerCall / 100n;
      const before = await ethers.provider.getBalance(owner.address);
      const tx     = await contract.connect(owner).collectFees();
      const rcpt   = await tx.wait();
      const gas    = rcpt.gasUsed * rcpt.gasPrice;
      const after  = await ethers.provider.getBalance(owner.address);
      expect(after - before + gas).to.equal(fee);
    });
    it("resets totalFeesCollected to 0 after collection", async function () {
      await contract.connect(owner).collectFees();
      expect(await contract.totalFeesCollected()).to.equal(0n);
    });
    it("non-owner cannot call collectFees", async function () {
      await expect(contract.connect(agentA).collectFees())
        .to.be.revertedWithCustomError(contract, "OwnableUnauthorizedAccount");
    });
    it("reverts when there are no fees to collect", async function () {
      await contract.connect(owner).collectFees();
      await expect(contract.connect(owner).collectFees())
        .to.be.revertedWith("No fees to collect");
    });
    it("collects fees accumulated from multiple calls", async function () {
      const fee = pricePerCall / 100n;
      await contract.connect(agentB).payPerCall(agentA.address);
      await contract.connect(agentB).payPerCall(agentA.address);
      // now 3 total calls (1 from beforeEach + 2 here)
      expect(await contract.totalFeesCollected()).to.equal(fee * 3n);
      const before = await ethers.provider.getBalance(owner.address);
      const tx     = await contract.connect(owner).collectFees();
      const rcpt   = await tx.wait();
      const gas    = rcpt.gasUsed * rcpt.gasPrice;
      const after  = await ethers.provider.getBalance(owner.address);
      expect(after - before + gas).to.equal(fee * 3n);
    });
  });

  // ── getChannel / getAgentChannelCount ─────────────────────────────────────
  describe("views", function () {
    it("getChannel returns zero struct for non-existent channel", async function () {
      const ch = await contract.getChannel(agentA.address, agentB.address);
      expect(ch.active).to.be.false;
      expect(ch.balance).to.equal(0n);
      expect(ch.agentA).to.equal(ethers.ZeroAddress);
    });
    it("getAgentChannelCount returns 0 before any deposits", async function () {
      expect(await contract.getAgentChannelCount(agentA.address)).to.equal(0n);
    });
    it("getAgentChannelCount returns correct count after multiple channels", async function () {
      await contract.connect(agentA).deposit(agentB.address, pricePerCall, { value: deposit1 });
      await contract.connect(agentA).deposit(agentC.address, pricePerCall, { value: deposit1 });
      expect(await contract.getAgentChannelCount(agentA.address)).to.equal(2n);
      expect(await contract.getAgentChannelCount(agentB.address)).to.equal(1n);
      expect(await contract.getAgentChannelCount(agentC.address)).to.equal(1n);
    });
    it("top-up does not double-count channel for agentA", async function () {
      await contract.connect(agentA).deposit(agentB.address, pricePerCall, { value: deposit1 });
      await contract.connect(agentA).deposit(agentB.address, pricePerCall, { value: deposit1 });
      expect(await contract.getAgentChannelCount(agentA.address)).to.equal(1n);
    });
  });
});
