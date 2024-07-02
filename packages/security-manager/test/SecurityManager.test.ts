import { ethers, upgrades } from "hardhat";
import { expect } from 'chai';
import { SecurityManager, SecurityManager__factory } from '../typechain-types';
import { ERC721Security, ERC721Security__factory } from '../typechain-types';
import { TestContract1, TestContract1__factory } from "../typechain-types";
import {ERC721SecurityBeacon, ERC721SecurityBeacon__factory} from "../typechain-types";
import {SignerWithAddress} from "@nomiclabs/hardhat-ethers/signers";
import {Test} from "mocha";

describe('SecurityManager', () => {
    let ERC721SecurityFactory: ERC721Security__factory;
    let erc721Security: ERC721Security;
    let SecurityManagerFactory: SecurityManager__factory;
    let securityManager: SecurityManager;
    let TestContract1Factory: TestContract1__factory;
    let testContract1: TestContract1;
    let ERC721SecurityBeaconFactory: ERC721SecurityBeacon__factory;
    let eRC721SecurityBeacon: ERC721SecurityBeacon;
    let erc721SecurityDeployedBySecurityManager: ERC721Security;

    let owner: SignerWithAddress;
    let admin: SignerWithAddress;
    let addr1: SignerWithAddress;
    let minter: SignerWithAddress;
    let trustedForwarder: string;

    const NAME = "SecurityToken";
    const SYMBOL = "STK";
    const CONTRACT_URI = "https://contract.metadata";
    const SALE_RECIPIENT = ethers.constants.AddressZero;
    const ROYALTY_RECIPIENT = ethers.constants.AddressZero;
    const ROYALTY_BPS = 500;
    const PLATFORM_FEE_BPS = 200;
    const PLATFORM_FEE_RECIPIENT = ethers.constants.AddressZero;

    before(async () => {
        [owner, admin, addr1, minter] = await ethers.getSigners();
        trustedForwarder = ethers.constants.AddressZero; // Replace with actual address if available
        ERC721SecurityFactory = await ethers.getContractFactory("ERC721Security");
        TestContract1Factory = await ethers.getContractFactory("TestContract1");
        SecurityManagerFactory = await ethers.getContractFactory("SecurityManager");
        ERC721SecurityBeaconFactory = await ethers.getContractFactory("ERC721SecurityBeacon");


        erc721Security = await ERC721SecurityFactory.deploy();
        await erc721Security.initialize(
            await owner.getAddress(),
            await minter.getAddress(),
            NAME,
            SYMBOL,
            CONTRACT_URI,
            [trustedForwarder],
            SALE_RECIPIENT,
            ROYALTY_RECIPIENT,
            ROYALTY_BPS,
            PLATFORM_FEE_BPS,
            PLATFORM_FEE_RECIPIENT
        );

        eRC721SecurityBeacon = await ERC721SecurityBeaconFactory.deploy(erc721Security.address);

        securityManager = await upgrades.deployProxy(
            SecurityManagerFactory,
            [
                owner.address,
                eRC721SecurityBeacon.address
            ],
            { initializer: 'initialize' }
        );
        await securityManager.deployed();

        testContract1 = await TestContract1Factory.deploy("test", 1);

        const collectionName = 'Test Collection 2';
        const collectionSymbol = 'TST2';
        const collectionURI = 'https://example.com/contract-metadata-2';
        const collectionCreateTx = await securityManager.connect(owner).createCollection(
            admin.address,
            securityManager.address,
            collectionName,
            collectionSymbol,
            collectionURI
        )
        const collections = await securityManager.getCollections();
        
        erc721SecurityDeployedBySecurityManager = ERC721SecurityFactory.attach(collections[collections.length - 1])
    });

    it('should deploy with the correct roles and beacon', async () => {
        // Check default admin role
        expect(await securityManager.hasRole(await securityManager.MINTER_ROLE(), owner.address)).to.be.true;
        // Check beacon initialization
        expect(await securityManager.beacon()).to.equal(eRC721SecurityBeacon.address);
    });

    it('should create a new collection', async () => {
        const collectionName = 'Test Collection';
        const collectionSymbol = 'TST';
        const collectionURI = 'https://example.com/contract-metadata';

        await expect(securityManager.connect(owner).createCollection(
            admin.address,
            securityManager.address,
            collectionName,
            collectionSymbol,
            collectionURI
        )).to.emit(securityManager, 'CollectionCreated');

        const collections = await securityManager.getCollections();
        expect(collections).to.have.lengthOf(2);
        // Additional assertions on the created collection if needed
    });

    it('should mint a token to a collection', async () => {
        const tokenURI = 'https://example.com/token/1';

        // Create a new collection to mint into
        const collectionName = 'Test Collection';
        const collectionSymbol = 'TST';
        const collectionURI = 'https://example.com/contract-metadata';

        const createCollectionTx = await securityManager.connect(owner).createCollection(
            admin.address,
            securityManager.address,
            collectionName,
            collectionSymbol,
            collectionURI
        );

        const collections = await securityManager.getCollections();
        const collectionAddress = collections[collections.length - 1];
        // Mint a token to the newly created collection
        await securityManager.connect(owner).mintToken(
            collectionAddress,
            tokenURI,
            true,
            testContract1.address
        );

        // Optionally, you can perform additional checks on the minted token if needed
    });

    it('should verify token information at a given contract address', async () => {

    });
});
