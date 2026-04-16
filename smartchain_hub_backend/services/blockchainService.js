const { ethers } = require('ethers');

const OG_MAINNET_RPC = 'https://evmrpc.0g.ai';
const TX_ABI = ['function recordTransaction(bytes32 txHash, uint256 amount, uint256 fee, string route) external'];

const blockchainService = {
  getProvider: () => new ethers.JsonRpcProvider(OG_MAINNET_RPC, 16661),

  recordTransaction: async (privateKey, amount, fee, route) => {
    const provider = blockchainService.getProvider();
    const signer = new ethers.Wallet(privateKey, provider);
    const contract = new ethers.Contract(process.env.CONTRACT_ADDRESS, TX_ABI, signer);
    const hash = ethers.id(`${Date.now()}-${amount}`);
    const tx = await contract.recordTransaction(hash, ethers.parseUnits(String(amount), 18), ethers.parseUnits(String(fee), 18), route);
    await tx.wait();
    return tx.hash;
  },
};

module.exports = blockchainService;
