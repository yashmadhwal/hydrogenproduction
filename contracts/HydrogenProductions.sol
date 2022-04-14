// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;

// Importing Libraries
import '@openzeppelin/contracts/token/ERC20/ERC20.sol';
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import '@openzeppelin/contracts/access/Ownable.sol';
import 'hardhat/console.sol';

contract HydrogenProduction is ERC20, Ownable, ERC20Burnable {

    constructor(string memory _name, string memory _symbol) ERC20(_name, _symbol) {}

    function mintingEnergy(uint _amount) public onlyOwner{
        require(_amount !=0,'Cannot produce zero energy');
        _mint(msg.sender, _amount);
    }
}