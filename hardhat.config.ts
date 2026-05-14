import type { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import * as dotenv from "dotenv";

dotenv.config();

const PRIVATE_KEY = process.env.PRIVATE_KEY || "";
const LITVM_RPC_URL =
  process.env.LITVM_RPC_URL || "https://rpc.liteforge.caldera.xyz";

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
      viaIR: true,
    },
  },

  networks: {
    // LitVM LiteForge Testnet — Chain ID 4441
    liteforge: {
      url: LITVM_RPC_URL,
      chainId: 4441,
      accounts: PRIVATE_KEY ? [PRIVATE_KEY] : [],
    },

    // Local Hardhat network for tests
    hardhat: {
      chainId: 31337,
    },
  },

  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts",
  },

  gasReporter: {
    enabled: process.env.REPORT_GAS === "true",
    currency: "USD",
  },

  etherscan: {
    apiKey: {
      liteforge: process.env.EXPLORER_API_KEY || "no-api-key",
    },
    customChains: [
      {
        network: "liteforge",
        chainId: 4441,
        urls: {
          apiURL: "https://liteforge.explorer.caldera.xyz/api",
          browserURL: "https://liteforge.explorer.caldera.xyz",
        },
      },
    ],
  },
};

export default config;
