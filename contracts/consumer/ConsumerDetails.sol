//SPDX-License-Identifier: Unlicensed

pragma solidity ^0.8.0;

contract ConsumerDetails {
    address owner;

    // Ideally the details includes contact information, etc
    string public details;

    constructor(address _sender){
        owner = _sender;
    }

    function changeDetails(string memory _newDetails, address _sender) public{
        require(_sender == owner, "You are not the consumer");
        details = _newDetails;
    }
}