# Presale Contract

This repository contains the implementation of a **Presale Contract** developed using Hardhat and Solidity. The contract facilitates the sale of ERC20 tokens during a specified presale period, supporting payments in Ether (ETH) and USDT.

## Features

- **Token Sales:** Users can purchase tokens with Ether or USDT.
- **Price Feeds:** Utilizes Chainlink for real-time ETH/USD price conversion.
- **Gift Codes:** Tracks purchases associated with unique gift codes.
- **Owner Management:** Allows the owner to update prices, withdraw funds, and manage presale tokens.
- **Presale Period:** Ensures token sales occur only during the defined period.
- **Secure Transactions:** Implements reentrancy protection for safe token transfers.

## Prerequisites

Ensure you have the following tools installed before deploying and interacting with the contract:

- **Node.js** and **npm**
- **Hardhat**
- A wallet (e.g., MetaMask) with test ETH and USDT for testing on a testnet (e.g., Goerli, Sepolia).
- Chainlink ETH/USD price feed address for the deployed network.

## Contract Details

### Constructor Parameters

The contract requires the following parameters during deployment:

1. **`_tokenPrice`** - Price of 1 token in USD (multiplied by `1e-3`).
2. **`_tokensForSale`** - Total number of tokens available for sale.
3. **`_openingTime`** - Presale opening timestamp.
4. **`_closingTime`** - Presale closing timestamp.
5. **`_priceFeedAddress`** - Address of the Chainlink price feed.
6. **`_token`** - Address of the ERC20 token to be sold.
7. **`_usdtToken`** - Address of the USDT token contract.
8. **`_owner`** - Address of the contract owner.

## Deployment Steps

1. Clone the repository and install dependencies:
   ```bash
   git clone <repository_url>
   cd <repository_folder>
   npm install
