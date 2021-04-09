pragma solidity ^0.6.0;

import '@openzeppelin/contracts-upgradeable/token/ERC20/ERC20Upgradeable.sol';
import '@openzeppelin/contracts-upgradeable/proxy/Initializable.sol';

contract TutorialToken is Initializable, ERC20Upgradeable {

    function initialize(uint256 amount) public initializer {
        _mint(msg.sender, amount);
    }
}