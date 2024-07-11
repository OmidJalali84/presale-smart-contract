const { network } = require("hardhat")
const { verify } = require("../utils/verify")
const { args } = require("../helper-hardhat.config")

module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deployer } = await getNamedAccounts()
    const { deploy, log } = deployments
    const chainId = network.config.chainId

    let ethUsdPriceFeedAddress, sendingToken, receivingToken, owner
    if (chainId == 31337) {
        const ethUsdAggregator = await deployments.get("MockV3Aggregator")
        const stContract = await deployments.get("ST")
        const rtContract = await deployments.get("RT")
        ethUsdPriceFeedAddress = ethUsdAggregator.address
        sendingToken = stContract.address
        receivingToken = rtContract.address
        owner = (await getNamedAccounts()).owner
    } else {
        ethUsdPriceFeedAddress = "0x694AA1769357215DE4FAC081bf1f309aDC325306"
        sendingToken = "0x95FcB3c84CA2250356eD78d75bed1A15385193D2"
        receivingToken = "0xdCdC73413C6136c9ABcC3E8d250af42947aC2Fc7"
        owner = "0x6Ac97c57138BD707680A10A798bAf24aCe62Ae9D"
    }
    args.push(ethUsdPriceFeedAddress, sendingToken, receivingToken, owner)

    log("Deploying, please wait...")
    const ICO = await deploy("Presell", {
        from: deployer,
        args: args,
        log: true,
        waitConfirmations: chainId == 31337 ? 1 : 6,
    })
    log("Deployed!!!")

    if (chainId != 31337) {
        await verify(ICO.address, args)
    }
}

module.exports.tags = ["all", "ico"]
