import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { DeployFunction } from 'hardhat-deploy/types';
import { ethers } from 'ethers';

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

  await deploy('TokenERC721Bridge', {
    from: deployer,
    proxy: {
      execute: {
        init: {
          methodName: "initialize",
          args: [
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

};
export default func;
func.tags = ['all', '721Security'];
