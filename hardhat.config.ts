require('hardhat-typechain');
require('@openzeppelin/hardhat-upgrades');
require('@nomiclabs/hardhat-waffle');

const ROPSTEN_INFURA_KEY = "";
const ROPSTEN_PRIVATE_KEY = "";

module.exports = {
  networks: {
    ropsten: {
      url: `https://ropsten.infura.io/v3/${ROPSTEN_INFURA_KEY}`,
      accounts: [`0x${ROPSTEN_PRIVATE_KEY}`]
    },
    bsctestnet: {
      url: `https://data-seed-prebsc-1-s1.binance.org:8545/`,
      accounts: [`0x${ROPSTEN_PRIVATE_KEY}`],
      chainId: 97,
      gasPrice: 20000000000
    }, 
  },
  solidity: {
    compilers: [
      {
        version: "0.8.4",
        settings: {
          optimizer: {
            enabled: true,
            runs: 999999999
          }
        } 
      },
      {
        version: "0.5.16",
        settings: {
          optimizer: {
            enabled: true,
            runs: 999999999
          }
        }  
      }
    ]
  }
}
