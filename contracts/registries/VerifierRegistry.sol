//SPDX-License-Identifier: Unlicensed

pragma solidity ^0.8.0;

import {Base64} from "./libraries/Base64.sol";
import {Registry} from "./Registry.sol";

contract VerifierRegistry is Registry {

    // Removed the mapping to check verifiers as I am not certain if it works (as it is never read)
    // also the DApp contract has roles which will be used to manage authorization

    function insertVerifier(string memory _did, address _contractKey)
    public
    returns (uint256)
  {
    return
      Registry.insertEntry(_did, _contractKey
      );
  }


  function deleteVerifier(string memory _did) public returns (bool) {
    return Registry.deleteEntry(Base64.encode(bytes(_did)));
  }


  function getVerifier(string memory _did)
    public
    view
    returns (string memory, address)
  {
    return Registry.getEntry(_did);
  }
}