require("@nomicfoundation/hardhat-toolbox");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.20",
  paths: { tests: "./tests" },
  mocha: { spec: "tests/**/*.{js,ts}" },
  networks: {
    hardhat: {},
    // ── 0G Networks (Hackathon primary) ──────────────────────────
    og_mainnet: {
      url: "https://evmrpc.0g.ai",
      chainId: 16661,
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
    },
    og_newton: {
      url: "https://rpc-testnet.0g.ai",
      chainId: 16600,
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
    },
    // ── Ethereum Networks ─────────────────────────────────────────
    ethereum: {
      url: `https://mainnet.infura.io/v3/${process.env.INFURA_KEY || ""}`,
      chainId: 1,
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
    },
    sepolia: {
      url: `https://sepolia.infura.io/v3/${process.env.INFURA_KEY || ""}`,
      chainId: 11155111,
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
    },
  },
  etherscan: {
    apiKey: {
      og_mainnet: "no-api-key-needed",
      mainnet: process.env.ETHERSCAN_API_KEY || "",
      sepolia: process.env.ETHERSCAN_API_KEY || "",
    },
    customChains: [
      {
        network: "og_mainnet",
        chainId: 16661,
        urls: {
          apiURL: "https://chainscan.0g.ai/api",
          browserURL: "https://chainscan.0g.ai",
        },
      },
    ],
  },
};
