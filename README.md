<div align="center">
    <img src="assets/vaiotLogo.svg" alt="VAIOT Logo" width="400"/>
</div>

# ETH-BSC Bridge Contracts

This repository contains the smart contracts necessary for operating the ETH-BSC Bridge, facilitating seamless token transfers between the Ethereum (ETH) and Binance Smart Chain (BSC) networks. It includes the UpgradeableBridgeContract, along with token contracts for both networks, ensuring a flexible and secure bridge operation.

## Contracts Overview

<ul>
    <li>UpgradeableBridgeContract.sol: An upgradeable smart contract that handles the locking and unlocking of tokens as they are transferred between chains. It utilizes OpenZeppelin's libraries for upgradeability, security, and ownership.</li>

    <li>VAIToken.sol: A BEP20 token contract example for Binance Smart Chain. It includes standard BEP20 functionalities such as transfer, allowance, and balance management.</li>

    <li>VAITokenETH.sol: An ERC777 token contract example for Ethereum. It demonstrates advanced token features including operator permissions and sending tokens with data.</li>

</ul>

## Prerequisites

<ul>
    <li>Node.js and npm</li>
    <li>Hardhat for smart contract compilation and deployment</li>
    <li>Ganache or a testnet/mainnet connection for deployment and testing</li>
</ul>

## Installation

    Clone the repository to your local machine:

```bash

git clone https://github.com/VAIOT/eth-bsc-bridge-contracts.git
cd eth-bsc-bridge-contracts
```

Install the required npm packages:

```bash
    npm install
```

## Testing

The repository includes test files for validating the functionality of the smart contracts. To run the tests execute the following command:

```bash
    npx hardhat test
```

### Deployment

```bash

npx hardhat compile

npx hardhat run scripts/deploy.js --network <network_name>
```

## Configuration

Update the .env file with all the variables found in the .env.example:

```bash
ROPSTEN_INFURA_KEY = //
ROPSTEN_PRIVATE_KEY = //
```

## Contributing

Contributions are what make the open-source community such an amazing place to learn, inspire, and create. Any contributions you make are greatly appreciated.
