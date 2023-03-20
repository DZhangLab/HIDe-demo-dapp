// SPDX-License-Identifier: Unliscensed

pragma solidity ^0.8.1;

import "./Roles.sol";
import "./user/Proxy.sol";
import "./registries/UserRegistry.sol";
import "./registries/VerifierRegistry.sol";
import "./verifier/VerifierDetails.sol";
import "./registries/ConsumerRegistry.sol";
import "./consumer/ConsumerDetails.sol";

import "hardhat/console.sol";

contract DApp{

    event consumerAdded(address, string);

    // Stores all the patients in a registry
    UserRegistry userRegistry;

    // Store all the verifiers
    VerifierRegistry verifierRegistry;

    // Store all the consumers
    ConsumerRegistry consumerRegistry;

    using Roles for Roles.Role;

    // Different roles
    Roles.Role private _patient;
    Roles.Role private _consumer;
    Roles.Role private _verifier;

    address owner;

    constructor(){
        // Deploys the user registry contract
        userRegistry = new UserRegistry();
        verifierRegistry = new VerifierRegistry();
        consumerRegistry = new ConsumerRegistry();
        owner = msg.sender;
    }

    // Function for the owner to add consumers
     function addConsumer(string memory _did, address _cAddress) public{
        console.log("Here1");
        require(msg.sender == owner, "You are not the owner");
        console.log("Here2");
        _consumer.add(_cAddress);
        ConsumerDetails cDet = new ConsumerDetails(msg.sender);
        consumerRegistry.insertConsumer(_did, address(cDet));
        emit consumerAdded(_cAddress, _did);
    }

    // Function for the owner to add verifiers
    function addVerifier(string memory _did, address _vAddress) public {
        require(msg.sender == owner, "You are not the owner");
        _verifier.add(_vAddress);
        VerifierDetails vDet = new VerifierDetails(msg.sender);
        verifierRegistry.insertVerifier(_did, address(vDet));
    }
 
    // patientSetup - The Proxy Contract of the patient is given patient permissions
    // and the (patient DID, Proxy contract address) is added to the registry
    function patientSetup(string memory _did) external{
        // msg.sender will the be the Proxy Contract Address
        _patient.add(msg.sender);
        userRegistry.insertUser(_did, msg.sender);
    }

    // Given the patientDID returns the contract key
    function getPatientProxy(string memory _patientDid) public view returns(address){
        (, address contractKey) = userRegistry.getUser(_patientDid);
        return contractKey;
    }

    // Consumer (or owner for now) can add something to the patient data
    function addDataToPatient(string memory _patientDid, string memory data) public{
        require(_consumer.has(msg.sender) || msg.sender == owner, "DOES_NOT_HAVE_CONSUMER_ROLE"); //remove owner condition
        // Gets the contract (proxy contract) address of the DID
        (, address contractKey) = userRegistry.getUser(_patientDid);

        // Adds data to that entry
        Proxy pContract = Proxy(contractKey);
        pContract.addInfo(msg.sender, data);
    }

    // Function to verify the patient
    function verifyPatient(string memory _patientDid) public{
        require(_verifier.has(msg.sender) || msg.sender == owner, "DOES_NOT_HAVE_VERIFIER_ROLE");
        
        (, address contractKey) = userRegistry.getUser(_patientDid);

        Proxy pContract = Proxy(contractKey);
        pContract.setVerification(msg.sender);
    }

    function addAttestation(string memory _newHash, string memory _patientDid) public{
        require(_verifier.has(msg.sender) || msg.sender == owner, "DOES_NOT_HAVE_VERIFIER_ROLE");

        (, address contractKey) = userRegistry.getUser(_patientDid);
        Proxy pContract = Proxy(contractKey);
        pContract.setHash(_newHash);
    }

    // Retrieves the information stored in the proxy contract
    function getPatientData(string memory _patientDid) public view returns(Proxy.Entry[] memory){
        (, address contractKey) = userRegistry.getUser(_patientDid);
        Proxy pContract = Proxy(contractKey);
        return pContract.viewEntries();
    }
}