// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.11;

import "@openzeppelin/contracts-upgradeable/access/AccessControlEnumerableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/security/ReentrancyGuardUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/cryptography/ECDSAUpgradeable.sol";
import "@auditfortess/erc721-security/contracts/interface/ISecurityTokenERC721.sol";
import {ERC721Security} from "@auditfortess/erc721-security/contracts/tokens/ERC721Security.sol";
import {BeaconProxy} from "@openzeppelin/contracts/proxy/beacon/BeaconProxy.sol";
import "@openzeppelin/contracts/proxy/beacon/IBeacon.sol";
import {Strings} from "@openzeppelin/contracts/utils/Strings.sol";

contract SecurityManager is Initializable, AccessControlEnumerableUpgradeable, ReentrancyGuardUpgradeable {
    using Strings for uint256;
    using ECDSAUpgradeable for bytes32;

    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    IBeacon public beacon;
    address[] private collections;
    address private nftHolder;

    event CollectionCreated(address indexed contractAddress, string _name, string  _symbol, string  _contractURI);
    event SecureFieldUpdated(address indexed contractAddress, bool secure);

    function initialize(address _defaultAdmin, address _beacon) external initializer {
        __AccessControlEnumerable_init();
        __ReentrancyGuard_init();

        _setupRole(DEFAULT_ADMIN_ROLE, _defaultAdmin);
        _setupRole(MINTER_ROLE, _defaultAdmin);
        beacon = IBeacon(_beacon);
        nftHolder = _defaultAdmin;
    }

    function createCollection(
        address _defaultAdmin,
        address _defaultMinter,
        string memory _name,
        string memory _symbol,
        string memory _contractURI
    ) external onlyRole(MINTER_ROLE) returns (address) {
        BeaconProxy proxy = new BeaconProxy(
            address(beacon),
            abi.encodeWithSignature(
                "initialize(address,address,string,string,string,address[],address,address,uint128,uint128,address)",
                _defaultAdmin,
                _defaultMinter,
                _name,
                _symbol,
                _contractURI,
                 new address[](0),
                _defaultAdmin,
                _defaultAdmin,
                0,
                0,
                0
            )
        );

        address contractAddress = address(proxy);
        collections.push(contractAddress);

        emit CollectionCreated(contractAddress, _name, _symbol, _contractURI);

        return contractAddress;
    }

    function mintToken(
        address collection,
        string calldata _uri,
        bool _secure,
        address contractAddress
    ) external onlyRole(MINTER_ROLE) nonReentrant returns (uint256) {
        require(bytes(_uri).length > 0, "Empty URI");
        require(collection != address(0), "Invalid collection address");
        require(contractAddress != address(0), "Invalid contract address");

        // The token ID is generated based on the contract address
        uint256 tokenId = uint256(uint160(contractAddress));

        // Call the mint function of the ERC721 contract
        ERC721Security(collection).mintTo(nftHolder, _uri, _secure, contractAddress);

        return tokenId;
    }

    function verifyTokenAtAddress(address _contractAddress) external view returns (ERC721Security.SecurityInfo[] memory res) {
        require(_contractAddress != address(0), "Invalid contract address");

        uint256 tokenId = uint256(uint160(_contractAddress));
        uint256 matchingCount = 0;

        // First, count the number of matching tokens to allocate memory for the result array
        for (uint i = 0; i < collections.length; i++) {
            ERC721Security erc721security = ERC721Security(collections[i]);
            // Check if the token URI exists in the collection for the given token ID
            try erc721security.tokenURI(tokenId) returns (string memory uri) {
                if (bytes(uri).length > 0) {
                    matchingCount++;
                }
            } catch {
                // If the call to tokenURI reverts, continue to the next collection
                continue;
            }
        }

        // Allocate memory for the result array
        res = new ERC721Security.SecurityInfo[](matchingCount);
        uint256 index = 0;

        // Iterate through the collections again to populate the result array
        for (uint i = 0; i < collections.length; i++) {
            ERC721Security erc721security = ERC721Security(collections[i]);
            // Check if the token URI exists in the collection for the given token ID
            try erc721security.tokenURI(tokenId) returns (string memory uri) {
                if (bytes(uri).length > 0) {
                    (
                        string memory secUri,
                        uint256 hashBytecode,
                        uint256 hashInitData,
                        bool secure,
                        address contractAddress
                    ) = erc721security.contracts(_contractAddress);

                    res[index] = ERC721Security.SecurityInfo({
                        uri: secUri,
                        hashBytecode: hashBytecode,
                        hashInitData: hashInitData,
                        secure: secure,
                        contractAddress: contractAddress
                    });
                    index++;
                }
            } catch {
                // If the call to tokenURI reverts, continue to the next collection
                continue;
            }
        }

        return res;
    }

    function getCollections() external view returns (address[] memory) {
        return collections;
    }
}