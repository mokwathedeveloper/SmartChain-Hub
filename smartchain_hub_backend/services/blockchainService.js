const { ethers } = require('ethers');
const config = require('../config/blockchainConfig');

// Updated ABIs for current contracts
const TRANSACTION_ABI = [
  'function recordTransaction(bytes32 txHash, uint256 amount, uint256 fee, string route) external',
  'function getTransaction(bytes32 txHash) external view returns (tuple(address sender, uint256 amount, uint256 fee, string route, bool validated, uint256 timestamp))',
  'event TransactionRecorded(bytes32 indexed txHash, address indexed sender, uint256 amount)'
];

const AGENT_ID_ABI = [
  'function mintAgentID(bytes32 modelHash) external',
  'function updateMemory(bytes32 newMemoryRoot, uint256 savingsWei) external',
  'function getAgent(address owner) external view returns (tuple(address owner, bytes32 memoryRoot, bytes32 modelHash, uint256 reputation, uint256 totalSavings, uint256 mintedAt, bool exists))',
  'function hasMinted(address owner) external view returns (bool)'
];

const blockchainService = {
  getProvider: () => new ethers.JsonRpcProvider(config.OG_TESTNET_RPC, config.OG_CHAIN_ID),

  recordTransaction: async (privateKey, amount, fee, route) => {
    try {
      const provider = blockchainService.getProvider();
      const signer = new ethers.Wallet(privateKey, provider);
      const contract = new ethers.Contract(config.TRANSACTION_CONTRACT, TRANSACTION_ABI, signer);
      
      const hash = ethers.id(`${Date.now()}-${amount}-${route}`);
      const amountWei = ethers.parseUnits(String(amount), 18);
      const feeWei = ethers.parseUnits(String(fee), 18);
      
      const tx = await contract.recordTransaction(hash, amountWei, feeWei, route);
      await tx.wait();
      
      return { txHash: tx.hash, dataHash: hash };
    } catch (error) {
      console.error('Blockchain transaction failed:', error);
      throw error;
    }
  },

  mintAgentID: async (privateKey, modelHash) => {
    try {
      const provider = blockchainService.getProvider();
      const signer = new ethers.Wallet(privateKey, provider);
      const contract = new ethers.Contract(config.AGENT_ID_CONTRACT, AGENT_ID_ABI, signer);
      
      const tx = await contract.mintAgentID(modelHash);
      await tx.wait();
      
      return tx.hash;
    } catch (error) {
      console.error('Agent ID minting failed:', error);
      throw error;
    }
  },

  updateAgentMemory: async (privateKey, memoryRoot, savingsWei) => {
    try {
      const provider = blockchainService.getProvider();
      const signer = new ethers.Wallet(privateKey, provider);
      const contract = new ethers.Contract(config.AGENT_ID_CONTRACT, AGENT_ID_ABI, signer);
      
      const tx = await contract.updateMemory(memoryRoot, ethers.parseUnits(String(savingsWei), 18));
      await tx.wait();
      
      return tx.hash;
    } catch (error) {
      console.error('Agent memory update failed:', error);
      throw error;
    }
  },

  getAgentInfo: async (ownerAddress) => {
    try {
      const provider = blockchainService.getProvider();
      const contract = new ethers.Contract(config.AGENT_ID_CONTRACT, AGENT_ID_ABI, provider);
      
      const agent = await contract.getAgent(ownerAddress);
      return {
        owner: agent.owner,
        memoryRoot: agent.memoryRoot,
        modelHash: agent.modelHash,
        reputation: Number(agent.reputation),
        totalSavings: ethers.formatEther(agent.totalSavings),
        mintedAt: Number(agent.mintedAt),
        exists: agent.exists
      };
    } catch (error) {
      console.error('Failed to get agent info:', error);
      return null;
    }
  },

  getExplorerUrl: (txHash) => `${config.CHAINSCAN_URL}/tx/${txHash}`,
};

module.exports = blockchainService;
