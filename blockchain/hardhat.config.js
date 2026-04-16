require("@nomicfoundation/hardhat-toolbox");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.20",
  networks: {
    hardhat: {},
    og_mainnet: {
      url: "https://evmrpc.0g.ai",
      chainId: 16661,
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
    },
    og_newton: {
      url: "https://rpc-testnet.0g.ai",
      chainId: 16600,
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
    }
  },
  etherscan: {
    apiKey: { og_mainnet: "no-api-key-needed" },
    customChains: [{
      network: "og_mainnet",
      chainId: 16661,
      urls: {
        apiURL: "https://chainscan.0g.ai/api",
        browserURL: "https://chainscan.0g.ai"
      }
    }]
  }
};
