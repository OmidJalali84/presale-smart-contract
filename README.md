# Presale Contract

This repository contains the implementation of a **Presale Contract** developed using Hardhat and Solidity. The contract facilitates the sale of ERC20 tokens during a specified presale period, supporting payments in Ether (ETH) and USDT.

## Features

- **Token Sales:** Users can purchase tokens with Ether or USDT.
- **Price Feeds:** Utilizes Chainlink for real-time ETH/USD price conversion.
- **Gift Codes:** Tracks purchases associated with unique gift codes.
- **Owner Management:** Allows the owner to update prices, withdraw funds, and manage presale tokens.
- **Presale Period:** Ensures token sales occur only during the defined period.
- **Secure Transactions:** Implements reentrancy protection for safe token transfers.

---

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

---

## Functions Overview

### Public Functions

- **`buyTokensWithEther(uint256 giftCode)`**  
  Purchases tokens using Ether. Accepts a `giftCode` to track associated purchases.

- **`buyTokensWithUSDT(uint256 amount, uint256 giftCode)`**  
  Purchases tokens using USDT. Accepts an `amount` and a `giftCode`.

- **`getRemainingTokens()`**  
  Returns the number of tokens still available for sale.

### Owner Functions

- **`changePrice(uint256 newPrice)`**  
  Updates the token price.

- **`changeOwner(address payable newOwner)`**  
  Transfers ownership of the contract.

- **`withdrawEther()`**  
  Withdraws all accumulated Ether to the owner's wallet.

- **`withdrawToken(uint256 amount)`**  
  Withdraws a specified amount of tokens to the owner.

- **`endPresale()`**  
  Ends the presale and transfers remaining tokens to the owner.

---

## Events

- **`TokensPurchased(address indexed purchaser, uint256 amount)`**  
  Emitted when tokens are purchased.

- **`PresaleEnded(uint256 tokensSold)`**  
  Emitted when the presale ends.

- **`Withdrawal(address indexed owner, uint256 amount)`**  
  Emitted when funds are withdrawn by the owner.

---

## Security Considerations

- Implements reentrancy guard (`nonReentrant`) to prevent reentrancy attacks.
- Ensures presale functions only operate during the specified presale period (`onlyWhileOpen`).
- Transfers funds and tokens securely using OpenZeppelin libraries.

---

## License

This project is licensed under the **MIT License**. See the LICENSE file for details.

---

Feel free to contribute or raise issues to improve this project! 🚀
