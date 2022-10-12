require("@nomiclabs/hardhat-waffle");
import "@typechain/hardhat";
import "@nomiclabs/hardhat-ethers";
import "@nomiclabs/hardhat-waffle"
import "@nomiclabs/hardhat-etherscan";
import "hardhat-gas-reporter";
import "hardhat-deploy";

import {HardhatUserConfig} from "hardhat/config"

const secrets = require("./.secrets.json");

const config:HardhatUserConfig = {
  solidity: "0.8.17",
  networks: {
    hardhat: {
      accounts: {
        count: 3250,
      },
    },
    bsc_scan: {
      url: secrets.bsc_test,
      // "bsc_test" : "https://indulgent-solemn-patina.bsc-testnet.discover.quiknode.pro/8e90f7864625ff49df6c95bf18c12719842d4322/",
      accounts: [secrets.privateKey],
      verify: {
        etherscan: {
          apiKey: secrets.apiKey,
        },
      },
    },
  },
  gasReporter: {
    enabled: process.env.REPORT_GAS !== undefined,
    currency: "USD",
  },
  etherscan: {
    apiKey: secrets.apiKey,
  },
  namedAccounts: {
    deployer: 0,
    sender: 1,
  },
};

export default config;
