import { expect } from "chai";
import { ethers } from "hardhat";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { ERC721Security, ERC721Security__factory } from "../typechain-types";

describe("ERC721Security", function () {
    let ERC721SecurityFactory: ERC721Security__factory;
    let erc721Security: ERC721Security;
    let owner: SignerWithAddress;
    let addr1: SignerWithAddress;
    let addr2: SignerWithAddress;
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

    before(async function () {
        [owner, addr1, addr2, minter] = await ethers.getSigners();
        trustedForwarder = ethers.constants.AddressZero; // Replace with actual address if available
        ERC721SecurityFactory = await ethers.getContractFactory("ERC721Security");
    });

    beforeEach(async function () {
        erc721Security = await ERC721SecurityFactory.deploy();
        await erc721Security.initialize(
            owner.address,
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
    });

    it("should initialize correctly", async function () {
        expect(await erc721Security.owner()).to.equal(owner.address);
        expect(await erc721Security.name()).to.equal(NAME);
        expect(await erc721Security.symbol()).to.equal(SYMBOL);
        expect(await erc721Security.contractURI()).to.equal(CONTRACT_URI);
    });

    it("should allow minting by minter", async function () {
        await erc721Security.grantRole(await erc721Security.MINTER_ROLE(), minter.address);
        await erc721Security.connect(minter).mintTo(addr1.address, "https://token.metadata", true, addr1.address);
        expect(await erc721Security.balanceOf(addr1.address)).to.equal(1);
    });

    it("should verify mint request", async function () {
        // Add appropriate logic for verifying mint requests here
    });

    it("should mint with signature", async function () {
        // Add appropriate logic for minting with signature here
    });


    it("should update secure field", async function () {
        await erc721Security.grantRole(await erc721Security.MINTER_ROLE(), minter.address);
        await erc721Security.connect(minter).mintTo(addr1.address, "https://token.metadata", true, addr1.address);
        await erc721Security.connect(minter).updateSecureField(addr1.address, false);
        const info = await erc721Security.contracts(addr1.address);
        expect(info.secure).to.be.false;
    });
});
