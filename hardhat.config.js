require("hardhat-gas-reporter")
require("@nomiclabs/hardhat-etherscan")
require("dotenv").config()
require("solidity-coverage")
require("hardhat-deploy")
require("@nomicfoundation/hardhat-ethers")
require("hardhat-deploy-ethers")
require("@nomicfoundation/hardhat-chai-matchers")

/** @type import('hardhat/config').HardhatUserConfig */

const COINMARKETCAP_API_KEY = process.env.COINMARKETCAP_API_KEY || ""
const SEPOLIA_RPC_URL =
    process.env.SEPOLIA_RPC_URL ||
    "https://eth-sepolia.g.alchemy.com/v2/8ZrUEiJWsk7v8sUfDMmZEI0CRGSCyKjs"
const PRIVATE_KEY =
    process.env.PRIVATE_KEY || "28a207254be80cd56b8ef477444113b5d2c53329d0328e10cda6676764fb1b12"
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY || ""

const SEPOLIA_API_KEY = process.env.SEPOLIA_API_KEY

module.exports = {
    solidity: {
        compilers: [
            { version: "0.6.6" },
            { version: "0.8.24" },
            { version: "0.8.0" },
            { version: "0.8.22" },
            { version: "0.8.19" },
        ],
    },
    defaultNetwork: "hardhat",
    networks: {
        hardhat: {
            chainId: 31337,
            // gasPrice: 130000000000,
        },
        sepolia: {
            url: SEPOLIA_RPC_URL,
            accounts: [PRIVATE_KEY],
            chainId: 11155111,
            blockConfirmations: 6,
        },
    },

    namedAccounts: {
        deployer: {
            default: 0, // here this will by default take the first account as deployer
            1: 0, // similarly on mainnet it will take the first account as deployer. Note though that depending on how hardhat network are configured, the account 0 on one network can be different than on another
        },
        user: {
            default: 1,
        },
        owner: {
            default: 2,
        },
    },

    gasReporter: {
        enabled: true,
        currency: "USD",
        outputFile: "gas-report.txt",
        noColors: true,
        // coinmarketcap: COINMARKETCAP_API_KEY,
    },
    etherscan: {
        apiKey: ETHERSCAN_API_KEY,
    },
}
