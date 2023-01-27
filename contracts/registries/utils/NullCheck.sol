//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

/**
 * @dev Library for checking if a variable is null / initialized to the default value
 *
 * The following variable types are supported:
 *
 * - `string` (`isNullString`)
 */
library NullCheck {
  /**
   * @dev Checks if a string is null.
   *
   * Returns true if the string is empty.
   */
  function isNullString(string memory str) public pure returns (bool) {
    if (bytes(str).length != 0) return false;
    return true;
  }
}