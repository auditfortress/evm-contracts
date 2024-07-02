import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { DeployFunction } from 'hardhat-deploy/types';

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {

  console.log(`deploying Security Manager on network ${hre.network.name}`)

  const { deploy } = hre.deployments;
  const { deployer } = await hre.getNamedAccounts();

  const erc721SecurityBeacon = (await hre.deployments.get("ERC721SecurityBeacon")).address;

  const deployResult = await deploy('SecurityManager', {
    from: deployer,
    proxy: {
      execute: {
        init: {
          methodName: "initialize",
          args: [
            deployer,
            erc721SecurityBeacon
          ],
        },
      },
      proxyContract: "OpenZeppelinTransparentProxy",
    },
    log: true,
    autoMine: true,
  });

};
export default func;
func.tags = ['all', 'SecurityManager'];
