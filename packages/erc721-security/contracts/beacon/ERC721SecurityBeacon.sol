// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.11;

import {UpgradeableBeacon} from "@openzeppelin/contracts/proxy/beacon/UpgradeableBeacon.sol";

contract ERC721SecurityBeacon is UpgradeableBeacon {
    constructor(address impl) UpgradeableBeacon(impl) {

    }
}