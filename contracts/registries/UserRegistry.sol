//SPDX-License-Identifier: Unlicense

pragma solidity ^0.8.0;

import {Registry} from "./Registry.sol";

/**
 * @dev Contract for managing User Registries
 *
 * UserRegistry is an implementation of the Registry Contract
 * supporting get, insert and delete operations.
 *
 * The dictionary structure of the registry maps did's to
 * the DID document generation contract keys. Both variables are
 * encoded in Base64.
 */
contract UserRegistry is Registry {
  /**
   * @dev Get a user from the registry, given their did
   *
   * Returns a did-contractKey pair of the entry, or reverts with an error message
   */
  function getUser(string memory _did)
    public
    view
    returns (string memory did, address contractKey)
  {
    (did, contractKey) = Registry.getEntry(_did);

  }

  /**
   * @dev Insert a new user in the registry
   *
   * Emits the EntryInserted event
   * Reverts with an error message if entry already exists
   * Returns the updated total number of entries
   */
  function insertUser(string memory _did, address _contractKey)
    public
    returns (uint256)
  {
    return
      Registry.insertEntry(
        _did,
        _contractKey
      );
  }

  /**
   * @dev Deletes a user from the registry.
   *
   * Emits EntryDeleted event
   * Returns true if the entry was successfully deleted.
   */
  function deleteUser(string memory _did) public returns (bool) {
    return Registry.deleteEntry(_did);
  }
}