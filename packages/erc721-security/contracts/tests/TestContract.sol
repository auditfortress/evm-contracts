// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.0;

contract TestContract {
    // State variables
    string public var1;
    uint public var2;

    // Constructor to initialize the variables
    constructor(string memory _var1, uint _var2) {
        var1 = _var1;
        var2 = _var2;
    }

    // Function to set var1
    function setVar1(string memory _var1) public {
        var1 = _var1;
    }

    // Function to set var2
    function setVar2(uint _var2) public {
        var2 = _var2;
    }

    // Function to get var1
    function getVar1() public view returns (string memory) {
        return var1;
    }

    // Function to get var2
    function getVar2() public view returns (uint) {
        return var2;
    }
}
