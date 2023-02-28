// SPDX-License-Identifier: Unliscensed

pragma solidity ^0.8.1;

import "./Controller.sol";

contract Recovery {
    address user;
    uint256 delegateCount;

    // keeps track of the time the last delagate was added
    uint256 delegateAdded;

    struct Delegate {
        address dAddress;
        bool voted;
        bool permitted; // If the user ever wants to remove a delegate
    }

    struct RecoveryProposal {
        address creator;
        address newAddress;
        uint256 voteNo;
        uint256 voteYes;
        uint256 deployDate;
        uint256 status; //0-cancelled, 1-pending, 2-address changed
    }

    mapping(address => Delegate) delegates;
    RecoveryProposal proposal;
    bool proposalPending = false;

    Controller controller;

    constructor(address patientAddress) {
        user = patientAddress;
        controller = Controller(msg.sender);
    }

    // The user can add delegates
    function addDelegate(address _delegateAddress) public {
        require(msg.sender == user, "You are not the user");
        // TODO: Change 30 seconds to week
        require(
            delegateAdded + 30 seconds < block.timestamp,
            "It has not been a week since last delegate was added"
        );
        Delegate memory delegate = Delegate(_delegateAddress, false, true);
        delegates[_delegateAddress] = delegate;
        delegateAdded = block.timestamp;
    }

    // The user can revoke delegates
    function revokeDelegate(address _delegateAddress) public {
        require(msg.sender == user, "You are not the user");
        delegates[_delegateAddress].permitted = false;
    }

    // A delegate can create a proposal
    function proposeRecovery(address _newAddress) public {
        require(!proposalPending, "Proposal already Pending");
        require(
            delegates[msg.sender].permitted,
            "You are not a permitted delegate"
        );
        proposal = RecoveryProposal(
            msg.sender,
            _newAddress,
            0,
            1,
            block.timestamp,
            1
        );
        proposalPending = true;
    }

    function getProposal() public view returns (RecoveryProposal memory) {
        return proposal;
    }

    // A delegate can vote on a proposal. Each time a vote occurs that status of the contract is checked
    function voteProposal(uint256 vote) public {
        require(
            delegates[msg.sender].permitted,
            "You are not a permitted delegate"
        );
        require(proposalPending, "Proposal already finished");

        if (vote == 0) {
            proposal.voteNo = proposal.voteNo + 1;
        } else {
            proposal.voteYes = proposal.voteYes + 1;
        }

        // We can automatically end the vote if these conditions are met
        if (proposal.voteNo * 2 > delegateCount) {
            proposal.status = 0;
        }
        if (proposal.voteYes * 2 >= delegateCount) {
            proposal.status = 2;
            changeUserAddress(proposal.newAddress);
        }

        // checks if it has expired
        checkStatus();
    }

    // This function will likely be called by the backend (or frontend on a page reload)
    function checkStatus() public {
        if (proposal.deployDate + 1 weeks > block.timestamp) {
            if (proposal.voteNo > proposal.voteYes) {
                proposal.status = 0;
            } else {
                proposal.status = 2;
                changeUserAddress(proposal.newAddress);
            }
        }
    }

    function changeUserAddress(address _newAddress) private {
        controller.changeUserAddress(_newAddress);
    }

    // Returns the user type in terms of a uint. 0 - not a user, 1 - user, 2 - delegate
    function getUserType() public view returns (uint256) {
        if (msg.sender == user) {
            return 1;
        } else if (delegates[msg.sender].permitted) {
            return 2;
        } else {
            return 0;
        }
    }
}
