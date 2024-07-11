const { run } = require("hardhat")

const verify = async (contractAddress, args) => {
    console.log("Verifying contract...")
    try {
        await run("verify:verify", {
            address: contractAddress,
            constructorArguments: args,
        })
    } catch (e) {
        if (e.message === "Failed to obtain list of solc versions. Reason: Connect Timeout Error")
            console.error(e.message)
        await run("verify:verify", {
            address: contractAddress,
            constructorArguments: args,
        })
    }
}

module.exports = { verify }
