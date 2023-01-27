//SPDX-License-Identifier: Unlicense

pragma solidity ^0.8.0;

/**
 * @dev Contract for managing different types of registries.
 *
 * Registries have the following properties:
 * - add, update, *delete* and check for existence in constant time O(1)
 *
 * The following variable types are supported:
 *
 * - `string` (`isNullString`)
 */
contract Registry {

  // Our registry is actually a map from a key to a value
  mapping(string => address) registry;
  uint256 totalEntries;

  constructor() {
    totalEntries = 0;
  }

  event EntryInserted(string key, address value);
  event EntryUpdated(string key, address value);
  event EntryDeleted(string key);

  /**
   * @dev Get the total number of entries in the registry
   *
   * Returns the total number of entries in the registry
   */
  function getTotalEntries() public view returns (uint256) {
    return totalEntries;
  }

  /**
   * @dev Verifies if a key exists in the registry.
   *
   * Returns a bool representing the existence of the given key.
   */
  function verifyEntry(string memory _key) public view returns (bool) {
    return (registry[_key] != address(0));
  }

  /**
   * @dev Get the value of an entry in the register, given the key
   *
   * Returns a key-value pair of the entry, or reverts with an error message
   */
  function getEntry(string memory _key)
    internal
    view
    returns (string memory, address )
  {
    if (registry[_key] != address(0)) {
      return (_key, registry[_key]);
    }

    revert("Entry not found!");
  }

  /**
   * @dev Insert a new entry in the registry
   *
   * Emits the EntryInserted event
   * Reverts with an error message if entry already exists
   * Returns the updated total number of entries
   */
  function insertEntry(string memory _key, address _value)
    internal
    returns (uint256)
  {
    if (registry[_key] == address(0)) {
      registry[_key] = _value;
      totalEntries++;

      // Emit event
      emit EntryInserted(_key, _value);
      return totalEntries;
    }
    revert("Entry already exists!");
  }

  /**
   * @dev Updates the value of a registry entry
   *
   * Emits the EntryUpdated event
   * Returns the updated key-value pair
   */
  function updateEntry(string memory _key, address  _value)
    internal
    returns (string memory, address )
  {
    if (registry[_key] == address(0)) {
      registry[_key] = _value;

      // Emit event
      emit EntryUpdated(_key, _value);
      return (_key, _value);
    }
    revert("Entry not found!");
  }

  /**
   * @dev Deletes a registry entry.
   *
   * Emits EntryDeleted event
   * Returns true if the entry was successfully deleted.
   */
  function deleteEntry(string memory _key) internal returns (bool) {
    require(totalEntries > 0);

    if (registry[_key] == address(0)) {
      delete registry[_key];
      totalEntries--;
      emit EntryDeleted(_key);
    }

    // Return true if the delete operation was carried out successfully
    return registry[_key] == address(0);
  }
}
