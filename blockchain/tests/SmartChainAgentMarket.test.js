const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("SmartChainAgentMarket", function () {
  let market, owner, agentOwner, hirer, other;

  const PRICE     = ethers.parseEther("0.1");
  const SPECIALTY = ethers.encodeBytes32String("DeFi Routing");
  const MODEL     = ethers.encodeBytes32String("tf-v1.0");
  const TASK_REF  = "task-abc-123";

  const PROTOCOL_FEE_BPS = 1000n;
  const BPS_BASE         = 10_000n;

  beforeEach(async () => {
    [owner, agentOwner, hirer, other] = await ethers.getSigners();
    const Factory = await ethers.getContractFactory("SmartChainAgentMarket");
    market = await Factory.connect(owner).deploy();
  });

  // ── Listing ───────────────────────────────────────────────────────
  describe("listAgent", () => {
    it("lists an agent and stores correct fields", async () => {
      await market.connect(agentOwner).listAgent(PRICE, SPECIALTY, MODEL);
      const l = await market.getListing(agentOwner.address);
      expect(l.owner).to.equal(agentOwner.address);
      expect(l.pricePerTask).to.equal(PRICE);
      expect(l.specialty).to.equal(SPECIALTY);
      expect(l.modelHash).to.equal(MODEL);
      expect(l.active).to.equal(true);
    });

    it("emits AgentListed event", async () => {
      await expect(market.connect(agentOwner).listAgent(PRICE, SPECIALTY, MODEL))
        .to.emit(market, "AgentListed")
        .withArgs(agentOwner.address, PRICE, SPECIALTY);
    });

    it("reverts when price is zero", async () => {
      await expect(market.connect(agentOwner).listAgent(0n, SPECIALTY, MODEL))
        .to.be.revertedWith("Price > 0");
    });

    it("re-listing updates fields and keeps one entry in listedOwners", async () => {
      await market.connect(agentOwner).listAgent(PRICE, SPECIALTY, MODEL);
      const newPrice = ethers.parseEther("0.2");
      await market.connect(agentOwner).listAgent(newPrice, SPECIALTY, MODEL);
      const l = await market.getListing(agentOwner.address);
      expect(l.pricePerTask).to.equal(newPrice);
      const [, , volumeWei] = await market.getMarketStats();
      // listedOwners deduplication — still only 1 active listing
      const listings = await market.getActiveListings();
      expect(listings.length).to.equal(1);
    });
  });

  // ── Delisting ─────────────────────────────────────────────────────
  describe("delistAgent", () => {
    it("sets active to false and emits AgentDelisted", async () => {
      await market.connect(agentOwner).listAgent(PRICE, SPECIALTY, MODEL);
      await expect(market.connect(agentOwner).delistAgent())
        .to.emit(market, "AgentDelisted")
        .withArgs(agentOwner.address);
      const l = await market.getListing(agentOwner.address);
      expect(l.active).to.equal(false);
    });

    it("reverts if agent is not listed", async () => {
      await expect(market.connect(other).delistAgent())
        .to.be.revertedWith("Not listed");
    });

    it("removes from getActiveListings after delist", async () => {
      await market.connect(agentOwner).listAgent(PRICE, SPECIALTY, MODEL);
      await market.connect(agentOwner).delistAgent();
      const listings = await market.getActiveListings();
      expect(listings.length).to.equal(0);
    });
  });

  // ── Hiring ────────────────────────────────────────────────────────
  describe("hireAgent", () => {
    beforeEach(async () => {
      await market.connect(agentOwner).listAgent(PRICE, SPECIALTY, MODEL);
    });

    it("pays 90% to agent owner and keeps 10% as protocol fee", async () => {
      const protocolShare = (PRICE * PROTOCOL_FEE_BPS) / BPS_BASE;
      const ownerShare    = PRICE - protocolShare;

      const before = await ethers.provider.getBalance(agentOwner.address);
      await market.connect(hirer).hireAgent(agentOwner.address, TASK_REF, { value: PRICE });
      const after = await ethers.provider.getBalance(agentOwner.address);

      expect(after - before).to.equal(ownerShare);
      expect(await market.collectedProtocolFees()).to.equal(protocolShare);
    });

    it("increments totalHires and totalVolumeWei", async () => {
      await market.connect(hirer).hireAgent(agentOwner.address, TASK_REF, { value: PRICE });
      expect(await market.totalHires()).to.equal(1);
      expect(await market.totalVolumeWei()).to.equal(PRICE);
    });

    it("emits AgentHired event", async () => {
      await expect(
        market.connect(hirer).hireAgent(agentOwner.address, TASK_REF, { value: PRICE })
      )
        .to.emit(market, "AgentHired")
        .withArgs(1, hirer.address, agentOwner.address, PRICE, TASK_REF);
    });

    it("reverts when agent is not listed", async () => {
      await expect(
        market.connect(hirer).hireAgent(other.address, TASK_REF, { value: PRICE })
      ).to.be.revertedWith("Not listed");
    });

    it("reverts when payment is below price", async () => {
      await expect(
        market.connect(hirer).hireAgent(agentOwner.address, TASK_REF, { value: PRICE - 1n })
      ).to.be.revertedWith("Low payment");
    });

    it("reverts when agent is delisted", async () => {
      await market.connect(agentOwner).delistAgent();
      await expect(
        market.connect(hirer).hireAgent(agentOwner.address, TASK_REF, { value: PRICE })
      ).to.be.revertedWith("Not listed");
    });

    it("accumulates totalEarned and totalHires on listing", async () => {
      const protocolShare = (PRICE * PROTOCOL_FEE_BPS) / BPS_BASE;
      const ownerShare    = PRICE - protocolShare;
      await market.connect(hirer).hireAgent(agentOwner.address, TASK_REF, { value: PRICE });
      await market.connect(hirer).hireAgent(agentOwner.address, TASK_REF, { value: PRICE });
      const l = await market.getListing(agentOwner.address);
      expect(l.totalHires).to.equal(2);
      expect(l.totalEarned).to.equal(ownerShare * 2n);
    });
  });

  // ── Protocol fee withdrawal ───────────────────────────────────────
  describe("withdrawProtocolFees", () => {
    beforeEach(async () => {
      await market.connect(agentOwner).listAgent(PRICE, SPECIALTY, MODEL);
      await market.connect(hirer).hireAgent(agentOwner.address, TASK_REF, { value: PRICE });
    });

    it("transfers accumulated fees to recipient", async () => {
      const fees = await market.collectedProtocolFees();
      expect(fees).to.be.gt(0n);

      const before = await ethers.provider.getBalance(other.address);
      await market.connect(owner).withdrawProtocolFees(other.address);
      const after = await ethers.provider.getBalance(other.address);

      expect(after - before).to.equal(fees);
      expect(await market.collectedProtocolFees()).to.equal(0n);
    });

    it("emits FeesWithdrawn", async () => {
      const fees = await market.collectedProtocolFees();
      await expect(market.connect(owner).withdrawProtocolFees(other.address))
        .to.emit(market, "FeesWithdrawn")
        .withArgs(other.address, fees);
    });

    it("reverts when called by non-owner", async () => {
      await expect(market.connect(hirer).withdrawProtocolFees(hirer.address))
        .to.be.revertedWith("Not owner");
    });

    it("reverts when there are no fees to withdraw", async () => {
      await market.connect(owner).withdrawProtocolFees(other.address);
      await expect(market.connect(owner).withdrawProtocolFees(other.address))
        .to.be.revertedWith("Nothing to withdraw");
    });

    it("reverts with zero recipient address", async () => {
      await expect(market.connect(owner).withdrawProtocolFees(ethers.ZeroAddress))
        .to.be.revertedWith("Invalid recipient");
    });
  });

  // ── renounceOwnership fee sweep ───────────────────────────────────
  describe("renounceOwnership", () => {
    it("sweeps accumulated fees to owner before zeroing ownership", async () => {
      await market.connect(agentOwner).listAgent(PRICE, SPECIALTY, MODEL);
      await market.connect(hirer).hireAgent(agentOwner.address, TASK_REF, { value: PRICE });

      const fees   = await market.collectedProtocolFees();
      expect(fees).to.be.gt(0n);

      const before = await ethers.provider.getBalance(owner.address);
      const tx     = await market.connect(owner).renounceOwnership();
      const receipt = await tx.wait();
      const gasUsed = receipt.gasUsed * tx.gasPrice;
      const after  = await ethers.provider.getBalance(owner.address);

      // Owner balance increased by fees minus gas
      expect(after).to.be.closeTo(before + fees - gasUsed, ethers.parseEther("0.001"));
      expect(await market.collectedProtocolFees()).to.equal(0n);
      expect(await market.owner()).to.equal(ethers.ZeroAddress);
    });

    it("renounces cleanly when no fees accumulated", async () => {
      await market.connect(owner).renounceOwnership();
      expect(await market.owner()).to.equal(ethers.ZeroAddress);
    });

    it("reverts when called by non-owner", async () => {
      await expect(market.connect(other).renounceOwnership())
        .to.be.revertedWith("Not owner");
    });

    it("emits OwnershipTransferred to zero address", async () => {
      await expect(market.connect(owner).renounceOwnership())
        .to.emit(market, "OwnershipTransferred")
        .withArgs(owner.address, ethers.ZeroAddress);
    });
  });

  // ── 2-step ownership transfer ─────────────────────────────────────
  describe("transferOwnership / acceptOwnership", () => {
    it("completes 2-step ownership transfer", async () => {
      await market.connect(owner).transferOwnership(other.address);
      expect(await market.pendingOwner()).to.equal(other.address);

      await market.connect(other).acceptOwnership();
      expect(await market.owner()).to.equal(other.address);
      expect(await market.pendingOwner()).to.equal(ethers.ZeroAddress);
    });

    it("emits OwnershipTransferInitiated then OwnershipTransferred", async () => {
      await expect(market.connect(owner).transferOwnership(other.address))
        .to.emit(market, "OwnershipTransferInitiated")
        .withArgs(owner.address, other.address);

      await expect(market.connect(other).acceptOwnership())
        .to.emit(market, "OwnershipTransferred")
        .withArgs(owner.address, other.address);
    });

    it("reverts if wrong account calls acceptOwnership", async () => {
      await market.connect(owner).transferOwnership(other.address);
      await expect(market.connect(hirer).acceptOwnership())
        .to.be.revertedWith("Not pending owner");
    });

    it("reverts transferOwnership to zero address", async () => {
      await expect(market.connect(owner).transferOwnership(ethers.ZeroAddress))
        .to.be.revertedWith("New owner is zero address");
    });
  });

  // ── View helpers ──────────────────────────────────────────────────
  describe("getActiveListings / getMarketStats", () => {
    it("getActiveListings returns only active agents", async () => {
      await market.connect(agentOwner).listAgent(PRICE, SPECIALTY, MODEL);
      await market.connect(other).listAgent(ethers.parseEther("0.05"), MODEL, SPECIALTY);
      await market.connect(other).delistAgent();

      const active = await market.getActiveListings();
      expect(active.length).to.equal(1);
      expect(active[0].owner).to.equal(agentOwner.address);
    });

    it("getMarketStats returns correct listed count and volume", async () => {
      await market.connect(agentOwner).listAgent(PRICE, SPECIALTY, MODEL);
      await market.connect(hirer).hireAgent(agentOwner.address, TASK_REF, { value: PRICE });

      const [listed, hiresTotal, volumeWei] = await market.getMarketStats();
      expect(listed).to.equal(1);
      expect(hiresTotal).to.equal(1);
      expect(volumeWei).to.equal(PRICE);
    });
  });
});
