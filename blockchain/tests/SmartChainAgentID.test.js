const { ethers } = require("hardhat");
const { expect } = require("chai");

describe("SmartChainAgentID", function () {
  let contract, owner, user1, user2, user3;
  const modelHash  = ethers.encodeBytes32String("tf-model-v2.16");
  const modelHash2 = ethers.encodeBytes32String("tf-model-v2.17");
  const memRoot    = ethers.encodeBytes32String("0g-kv-root-abc1");
  const memRoot2   = ethers.encodeBytes32String("0g-kv-root-abc2");

  beforeEach(async function () {
    [owner, user1, user2, user3] = await ethers.getSigners();
    const Factory = await ethers.getContractFactory("SmartChainAgentID");
    contract = await Factory.deploy();
    await contract.waitForDeployment();
  });

  // ── Deployment ──────────────────────────────────────────────────────────────
  describe("Deployment", function () {
    it("sets deployer as owner", async function () {
      expect(await contract.owner()).to.equal(owner.address);
    });
    it("starts with totalAgents = 0", async function () {
      expect(await contract.totalAgents()).to.equal(0n);
    });
    it("no address has minted initially", async function () {
      expect(await contract.hasMinted(user1.address)).to.be.false;
    });
  });

  // ── mintAgentID ─────────────────────────────────────────────────────────────
  describe("mintAgentID", function () {
    it("mints successfully and sets all fields", async function () {
      await contract.connect(user1).mintAgentID(modelHash);
      const agent = await contract.getAgent(user1.address);
      expect(agent.owner).to.equal(user1.address);
      expect(agent.modelHash).to.equal(modelHash);
      expect(agent.memoryRoot).to.equal(ethers.ZeroHash);
      expect(agent.reputation).to.equal(0n);
      expect(agent.totalSavings).to.equal(0n);
      expect(agent.exists).to.be.true;
    });
    it("increments totalAgents on each mint", async function () {
      await contract.connect(user1).mintAgentID(modelHash);
      expect(await contract.totalAgents()).to.equal(1n);
      await contract.connect(user2).mintAgentID(modelHash);
      expect(await contract.totalAgents()).to.equal(2n);
      await contract.connect(user3).mintAgentID(modelHash);
      expect(await contract.totalAgents()).to.equal(3n);
    });
    it("sets hasMinted to true after minting", async function () {
      await contract.connect(user1).mintAgentID(modelHash);
      expect(await contract.hasMinted(user1.address)).to.be.true;
    });
    it("emits AgentMinted event with correct args", async function () {
      await expect(contract.connect(user1).mintAgentID(modelHash))
        .to.emit(contract, "AgentMinted")
        .withArgs(user1.address, modelHash, await ethers.provider.getBlock("latest").then(b => BigInt(b?.timestamp ?? 0) + 1n));
    });
    it("reverts on double mint by same address", async function () {
      await contract.connect(user1).mintAgentID(modelHash);
      await expect(contract.connect(user1).mintAgentID(modelHash2))
        .to.be.revertedWith("Agent ID already minted");
    });
    it("different users can mint independently", async function () {
      await contract.connect(user1).mintAgentID(modelHash);
      await contract.connect(user2).mintAgentID(modelHash2);
      const a1 = await contract.getAgent(user1.address);
      const a2 = await contract.getAgent(user2.address);
      expect(a1.modelHash).to.equal(modelHash);
      expect(a2.modelHash).to.equal(modelHash2);
      expect(a1.owner).to.not.equal(a2.owner);
    });
    it("records correct mintedAt timestamp", async function () {
      const tx   = await contract.connect(user1).mintAgentID(modelHash);
      const blk  = await tx.getBlock();
      const agent = await contract.getAgent(user1.address);
      expect(agent.mintedAt).to.equal(BigInt(blk.timestamp));
    });
    it("stores ZeroHash model hash when passed zero bytes", async function () {
      await contract.connect(user1).mintAgentID(ethers.ZeroHash);
      const agent = await contract.getAgent(user1.address);
      expect(agent.modelHash).to.equal(ethers.ZeroHash);
    });
  });

  // ── updateMemory ─────────────────────────────────────────────────────────────
  describe("updateMemory", function () {
    beforeEach(async function () {
      await contract.connect(user1).mintAgentID(modelHash);
    });
    it("updates memoryRoot correctly", async function () {
      await contract.connect(user1).updateMemory(memRoot, 1000n);
      const agent = await contract.getAgent(user1.address);
      expect(agent.memoryRoot).to.equal(memRoot);
    });
    it("increments reputation by 1 per call", async function () {
      await contract.connect(user1).updateMemory(memRoot, 100n);
      expect((await contract.getAgent(user1.address)).reputation).to.equal(1n);
      await contract.connect(user1).updateMemory(memRoot2, 200n);
      expect((await contract.getAgent(user1.address)).reputation).to.equal(2n);
    });
    it("accumulates totalSavings correctly", async function () {
      await contract.connect(user1).updateMemory(memRoot, 500n);
      await contract.connect(user1).updateMemory(memRoot2, 300n);
      expect((await contract.getAgent(user1.address)).totalSavings).to.equal(800n);
    });
    it("emits MemoryUpdated event", async function () {
      await expect(contract.connect(user1).updateMemory(memRoot, 500n))
        .to.emit(contract, "MemoryUpdated")
        .withArgs(user1.address, memRoot, 1n);
    });
    it("emits ReputationIncremented event", async function () {
      await expect(contract.connect(user1).updateMemory(memRoot, 500n))
        .to.emit(contract, "ReputationIncremented")
        .withArgs(user1.address, 1n, 500n);
    });
    it("reverts if caller has not minted", async function () {
      await expect(contract.connect(user2).updateMemory(memRoot, 100n))
        .to.be.revertedWith("No Agent ID - mint first");
    });
    it("allows zero savings update", async function () {
      await contract.connect(user1).updateMemory(memRoot, 0n);
      const agent = await contract.getAgent(user1.address);
      expect(agent.totalSavings).to.equal(0n);
      expect(agent.reputation).to.equal(1n);
    });
    it("allows updating memoryRoot to ZeroHash", async function () {
      await contract.connect(user1).updateMemory(memRoot, 100n);
      await contract.connect(user1).updateMemory(ethers.ZeroHash, 0n);
      expect((await contract.getAgent(user1.address)).memoryRoot).to.equal(ethers.ZeroHash);
    });
    it("multiple users update independently without interference", async function () {
      await contract.connect(user2).mintAgentID(modelHash2);
      await contract.connect(user1).updateMemory(memRoot, 100n);
      await contract.connect(user2).updateMemory(memRoot2, 9999n);
      expect((await contract.getAgent(user1.address)).totalSavings).to.equal(100n);
      expect((await contract.getAgent(user2.address)).totalSavings).to.equal(9999n);
    });
  });

  // ── getAgent ─────────────────────────────────────────────────────────────────
  describe("getAgent", function () {
    it("returns zero-value struct for un-minted address", async function () {
      const agent = await contract.getAgent(user1.address);
      expect(agent.exists).to.be.false;
      expect(agent.owner).to.equal(ethers.ZeroAddress);
    });
    it("returns full struct after mint", async function () {
      await contract.connect(user1).mintAgentID(modelHash);
      const agent = await contract.getAgent(user1.address);
      expect(agent.exists).to.be.true;
      expect(agent.owner).to.equal(user1.address);
    });
  });

  // ── resetMint ─────────────────────────────────────────────────────────────────
  describe("resetMint (owner-only)", function () {
    beforeEach(async function () {
      await contract.connect(user1).mintAgentID(modelHash);
    });
    it("owner can reset a minted address", async function () {
      await contract.connect(owner).resetMint(user1.address);
      expect(await contract.hasMinted(user1.address)).to.be.false;
    });
    it("decrements totalAgents on reset", async function () {
      await contract.connect(owner).resetMint(user1.address);
      expect(await contract.totalAgents()).to.equal(0n);
    });
    it("deletes agent struct on reset", async function () {
      await contract.connect(owner).resetMint(user1.address);
      const agent = await contract.getAgent(user1.address);
      expect(agent.exists).to.be.false;
    });
    it("allows re-mint after reset", async function () {
      await contract.connect(owner).resetMint(user1.address);
      await contract.connect(user1).mintAgentID(modelHash2);
      const agent = await contract.getAgent(user1.address);
      expect(agent.modelHash).to.equal(modelHash2);
    });
    it("non-owner cannot call resetMint", async function () {
      await expect(contract.connect(user1).resetMint(user1.address))
        .to.be.revertedWithCustomError(contract, "OwnableUnauthorizedAccount");
    });
    it("reverts if wallet has not minted", async function () {
      await expect(contract.connect(owner).resetMint(user2.address))
        .to.be.revertedWith("Wallet has not minted");
    });
    it("emits AgentReset event", async function () {
      await expect(contract.connect(owner).resetMint(user1.address))
        .to.emit(contract, "AgentReset")
        .withArgs(user1.address, owner.address, await ethers.provider.getBlock("latest").then(b => BigInt(b?.timestamp ?? 0) + 1n));
    });
  });

  // ── Soulbound — transfer blocked ─────────────────────────────────────────────
  describe("Soulbound enforcement", function () {
    it("transfer() always reverts", async function () {
      await expect(contract.connect(user1).transfer(user2.address, 1n))
        .to.be.revertedWith("Agent ID is soulbound - non-transferable");
    });
    it("transfer reverts even from owner", async function () {
      await expect(contract.connect(owner).transfer(user2.address, 1n))
        .to.be.revertedWith("Agent ID is soulbound - non-transferable");
    });
  });

  // ── Reputation accumulation at scale ─────────────────────────────────────────
  describe("Reputation at scale", function () {
    it("reputation accumulates correctly over 10 optimizations", async function () {
      await contract.connect(user1).mintAgentID(modelHash);
      for (let i = 0; i < 10; i++) {
        await contract.connect(user1).updateMemory(memRoot, 100n);
      }
      expect((await contract.getAgent(user1.address)).reputation).to.equal(10n);
    });
    it("totalSavings accumulates correctly over 10 optimizations", async function () {
      await contract.connect(user1).mintAgentID(modelHash);
      for (let i = 0; i < 10; i++) {
        await contract.connect(user1).updateMemory(memRoot, 250n);
      }
      expect((await contract.getAgent(user1.address)).totalSavings).to.equal(2500n);
    });
  });
});
