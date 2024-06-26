import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { DeployFunction } from 'hardhat-deploy-immutable-proxy/types';

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {

  console.log(`deploying contracts on network ${hre.network.name}`)
  const { deploy } = hre.deployments;
  const { deployer } = await hre.getNamedAccounts();
  console.log("deployer: ", deployer);
  const defaultAdmin = deployer;
  const name = "Test 721";
  const symbol = "Test";
  const contractURI = "";
  const trustedForwarders = [];
  const primarySaleRecipient = deployer;
  const royaltyRecipient = deployer;
  const royaltyBps = 500;
  const platformFeeBps = 1000;
  const platformFeeRecipient = deployer;

  const deployResult = await deploy('ERC721Security', {
    from: deployer,
    proxy: {
      execute: {
        init: {
          methodName: "initialize",
          args: [
            defaultAdmin,
            defaultAdmin,
            name,
            symbol,
            contractURI,
            trustedForwarders,
            primarySaleRecipient,
            royaltyRecipient,
            royaltyBps,
            platformFeeBps,
            platformFeeRecipient,
          ],
        },
      },
      proxyContract: "OpenZeppelinTransparentProxy",
    },
    log: true,
    autoMine: true,
  });

  // transfer tokens to the deployed address
  // Deploy the beacon contract
  const deployResultBeacon = await deploy("ERC721SecurityBeacon",{
    from: deployer,
    log: true,
    autoMine: true,
    args: [deployResult.implementation]
  });

  console.log("ERC721RaribleBeacon deployed to:", deployResultBeacon.address);
};
export default func;
func.tags = ['all', '721Security'];
