require("hardhat-typechain");
require("@openzeppelin/hardhat-upgrades");
require("@nomiclabs/hardhat-waffle");
require("dotenv").config();

const ROPSTEN_INFURA_KEY = process.env.ROPSTEN_INFURA_KEY;
const ROPSTEN_PRIVATE_KEY = process.env.ROPSTEN_PRIVATE_KEY;

module.exports = {
  networks: {
    ropsten: {
      url: `https://ropsten.infura.io/v3/${ROPSTEN_INFURA_KEY}`,
      accounts: [`0x0000000000000000000000000000000000000000`],
    },
    bsctestnet: {
      url: `https://data-seed-prebsc-1-s1.binance.org:8545/`,
      accounts: [`0x0000000000000000000000000000000000000000`],
      chainId: 97,
      gasPrice: 20000000000,
    },
  },
  solidity: {
    compilers: [
      {
        version: "0.8.4",
        settings: {
          optimizer: {
            enabled: true,
            runs: 999999999,
          },
        },
      },
      {
        version: "0.5.16",
        settings: {
          optimizer: {
            enabled: true,
            runs: 999999999,
          },
        },
      },
    ],
  },
};
