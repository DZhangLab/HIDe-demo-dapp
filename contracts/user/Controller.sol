// SPDX-License-Identifier: Unliscensed

pragma solidity ^0.8.1;

import "./Proxy.sol";
import "./Recovery.sol";
import "hardhat/console.sol";

contract Controller{

    address userAddress; // Public key (in ethereum this is their address)
    
    address primaryDelegateAddress; // The ethereum address of the main representative

    // Recovery Contract
    address recoveryAddress;

    Proxy proxy;
    Recovery recovery;

    constructor(address _applicationAddress, string memory _patientDid, string memory _hash){
        userAddress = msg.sender;
        //primaryDelegateAddress = _primaryDelegateAddress;

        recovery = new Recovery();
        proxy = new Proxy(_applicationAddress, _patientDid, _hash);

        proxy.createAccount();
        console.log("Address of Proxy: ", address(proxy));
    }

    // For the recovery contract to change the userAddress
    function changeUserAddress(address _newAddress) public{
        require(msg.sender == recoveryAddress, "You are not the recovery address, you cannot change the user address");
        userAddress = _newAddress;
    }


    // Development purproses, TODO: Delete
    function getProxyAddress() public view returns(address){
        return address(proxy);
    }

    // 
    function addDelegate(address _delegateAddress) public {
        recovery.addDelegate(_delegateAddress);
    }

}