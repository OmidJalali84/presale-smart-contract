const { network } = require("hardhat");
const INITIAL_SUPPLY = BigInt(1e24);

module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deploy, log } = deployments;
  const { deployer } = await getNamedAccounts();
  const chainId = network.config.chainId;
  // If we are on a local development network, we need to deploy mocks!
  if (chainId == 31337) {
    log("Local network detected! Deploying Receiving Token...");
    await deploy("RT", {
      contract: "RT",
      from: deployer,
      log: true,
      args: [INITIAL_SUPPLY],
    });
    log("Token Deployed!");
    log("------------------------------------------------");
    log(
      "You are deploying to a local network, you'll need a local network running to interact"
    );
    log(
      "Please run `npx hardhat console` to interact with the deployed smart contracts!"
    );
    log("------------------------------------------------");
  }
};
module.exports.tags = ["all", "RT"];
