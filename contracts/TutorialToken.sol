pragma solidity ^0.6.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract TutorialToken is ERC20 {

    constructor(uint amount) ERC20('Test ERC20', 'TEST') public {
        _mint(msg.sender, amount);
    }
}