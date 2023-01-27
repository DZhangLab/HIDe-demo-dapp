// SPDX-License-Identifier: Unliscensed

pragma solidity ^0.8.1;

import "../DApp.sol";
import "hardhat/console.sol";

contract Proxy{
    address public owner;

    // If the patient has been verified by a verifier
    bool public verified;

    DApp application;

    string public patientDid;

    string public patientHash; // I believe this should be part of the DID however I think it will change everytime new data is added onto IPFS

    struct Entry {
        string checkupInfo;
        address author;
    }

    struct Verification{
        uint timestamp;
        address verifierAddress;
    }

    Verification verification;

    Entry[] entries;

    constructor(address _application, string memory _patientDid, string memory _hash){
        application = DApp(_application);
        owner = msg.sender;
        patientDid = _patientDid;
        console.log("Hash: ", _hash);
        patientHash = _hash;
    }

    // This is used to change the address of the controller contract, not the user. 
    // This improves updatability, if a new controller is designed we can use this function to switch.
    function transfer(address _newOwner) public{
        owner = _newOwner;
    }

    // Creates an account in the application contract
    function createAccount() public{
        application.patientSetup(patientDid);
    }

    // Inserting entries into the entries array. Only the application can do this (and only consumers in the application can
    // send the transaction)
    function addInfo(address _sender, string memory _info) public{
        require(msg.sender == address(application), "You are not the application"); // Only the application can add entries
        entries.push(Entry( _info, _sender));
    }

    // Returns the entries
    function viewEntries() public view returns(Entry[] memory){
        return entries;
    }

    // Set the verification
    function setVerification(address _sender) public{
        require(msg.sender == address(application), "You are not the application");
        verified = true;
        verification = Verification(block.timestamp, _sender);
    }

    function setHash(string memory _newHash) public{
        require(msg.sender == address(application), "You are not the application");
        patientHash = _newHash;
    }
}