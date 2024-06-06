import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import { config as dotenvConfig } from "dotenv";
import { resolve } from "path";
import {ethers} from "ethers";
import '@openzeppelin/hardhat-upgrades';
import "hardhat-deploy";
import 'hardhat-abi-exporter';

const dotenvConfigPath: string = process.env.DOTENV_CONFIG_PATH || "./.env";
dotenvConfig({ path: resolve(__dirname, dotenvConfigPath) });

const config: HardhatUserConfig = {
  namedAccounts: {
    deployer: 0,
  },
  solidity: {
    version: "0.8.11",
    settings: {
      optimizer: {
        enabled: true,
        runs: 100, // Optimal for contract size and execution cost balance
      },
      // Consider adding other settings for specific needs
    },
  },
  networks: {
    hardhat: {
      accounts: {
        count: 100,
        accountsBalance: "10000000000000000000000000"
      },
    },
    base: {
      url: `https://mainnet.base.org`,
      accounts: [`${process.env.PRIVATE_KEY}`],
      saveDeployments: true,
      verify: {
        etherscan: {
          apiKey: `${process.env.ETHERSCAN_BASE}`,
        }
      }
    },
  },
  etherscan: {
    apiKey: {
      base: `${process.env.ETHERSCAN_BASE}`
    },
    customChains: [
      {
        network: "mantle",
        chainId: 5000,
        urls: {
          apiURL: "https://explorer.mantle.xyz/api",
          browserURL: "https://explorer.mantle.xyz/"
        }
      }
    ]
  }
};

export default config;
