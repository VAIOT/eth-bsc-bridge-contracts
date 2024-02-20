ETH-BSC Bridge Contracts

This repository contains the smart contracts necessary for operating the ETH-BSC Bridge, facilitating seamless token transfers between the Ethereum (ETH) and Binance Smart Chain (BSC) networks. It includes the UpgradeableBridgeContract, along with token contracts for both networks, ensuring a flexible and secure bridge operation.
Contracts Overview

    UpgradeableBridgeContract.sol: An upgradeable smart contract that handles the locking and unlocking of tokens as they are transferred between chains. It utilizes OpenZeppelin's libraries for upgradeability, security, and ownership.

    VAIToken.sol: A BEP20 token contract example for Binance Smart Chain. It includes standard BEP20 functionalities such as transfer, allowance, and balance management.

    VAITokenETH.sol: An ERC777 token contract example for Ethereum. It demonstrates advanced token features including operator permissions and sending tokens with data.

Getting Started
Prerequisites

    Node.js and npm
    Truffle or Hardhat for smart contract compilation and deployment
    Ganache or a testnet/mainnet connection for deployment and testing

Installation

    Clone the repository to your local machine:

    bash

git clone https://github.com/yourgithub/eth-bsc-bridge-contracts.git
cd eth-bsc-bridge-contracts

Install the required npm packages:

bash

    npm install

Testing

The repository includes test files for validating the functionality of the smart contracts. To run the tests:

    Ensure you have Ganache running, or configure your truffle-config.js or hardhat.config.js file to connect to a testnet/mainnet.

    Execute the test command:

    bash

truffle test

Or, if using Hardhat:

bash

    npx hardhat test

Deployment

    Compile the contracts:

    bash

truffle compile

Or with Hardhat:

bash

npx hardhat compile

Deploy the contracts to your chosen network:

bash

truffle migrate --network <network_name>

Or with Hardhat:

bash

    npx hardhat run scripts/deploy.js --network <network_name>

Configuration

    Update the .env file with your node URLs, private keys, and any other relevant configurations for deployment.

Contributing

We welcome contributions from the community! Please read our Contributing Guide for details on how to submit pull requests, report issues, or suggest improvements.
Security

This project is in the development stage and has not undergone a full security audit. Use at your own risk. If you discover a security issue, please report it privately to [security@example.com].
License

This project is licensed under the MIT License - see the LICENSE file for details.
