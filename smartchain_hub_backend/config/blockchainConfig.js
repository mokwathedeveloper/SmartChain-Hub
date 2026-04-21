module.exports = {
  // Updated to use 0G Galileo Testnet (current deployment)
  OG_TESTNET_RPC: process.env.OG_COMPUTE_RPC || 'https://evmrpc-testnet.0g.ai',
  OG_MAINNET_RPC: 'https://evmrpc.0g.ai',
  OG_CHAIN_ID: 16602, // Galileo Testnet
  CHAINSCAN_URL: 'https://scan-testnet.0g.ai',
  
  // Contract addresses from current deployment
  TRANSACTION_CONTRACT: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || '0xf95A1610be22046c334E3bD1b11D2B88519E6C52',
  PAYMENTS_CONTRACT: process.env.NEXT_PUBLIC_PAYMENTS_CONTRACT || '0x540aFf6B167F8B5889d852d124C545F5f876A7eB',
  AGENT_ID_CONTRACT: process.env.NEXT_PUBLIC_AGENT_ID_CONTRACT || '0x69C619374c6B901b99941Df7238fceb80d7DCd08',
  REVENUE_CONTRACT: process.env.NEXT_PUBLIC_REVENUE_CONTRACT || '0x8858886AEE6342DFA4DE5Cf66dB25dCF75b31A08',
};
