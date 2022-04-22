// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;
// ________________ ERC 1155 _________________________
import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/token/ERC1155/IERC1155.sol";
import "hardhat/console.sol";

contract SUPPLYHYDROGEN is ERC1155 {
    // assigning Batch Ids
    uint256 public constant WATER = 0;
    uint256 public constant RENEWABLES = 1;
    uint256 public constant HYDROGEN_FUEL = 2;

    // Self Instance
    IERC1155 public h2Token;

    // assigning Addresses of the producer
    address public WATER_PROVIDER;
    address public RENEWABLES_PROVIDER;
    address public FUEL_GENERATOR;

    constructor(address _water, address _energy, address _fuel) ERC1155("") {
        h2Token = IERC1155(address(this));

        WATER_PROVIDER = _water;
        RENEWABLES_PROVIDER = _energy;
        FUEL_GENERATOR = _fuel;
    }

    function mintEnergy(uint _amountEnergy) public onlyRenewable{
        require(_amountEnergy != 0,'Invalid amount of Energy');
        _mint(msg.sender, RENEWABLES, _amountEnergy, "");
    }

    function mintWater(uint _amountWater) public onlyWater{
        require(_amountWater != 0,'Invalid amount of Energy');
        _mint(msg.sender, WATER, _amountWater, "");
    }

    function mintHydrogen() public {

        uint _balanceEnergy = h2Token.balanceOf(msg.sender,RENEWABLES);
        uint _balanceWater = h2Token.balanceOf(msg.sender,WATER);
        // todo: Correct H2 Formula to check (require statement)
        uint h2 = _balanceEnergy + _balanceWater;
        _mint(msg.sender, HYDROGEN_FUEL, h2 , "");
        _burn(msg.sender, 0, _balanceWater);
        _burn(msg.sender, 1, _balanceEnergy);

    }

    modifier onlyRenewable(){
        require(msg.sender == RENEWABLES_PROVIDER, 'Not Authorised Access');
        _;
    }

    modifier onlyWater(){
        require(msg.sender == WATER_PROVIDER, 'Not Authorised Access');
        _;
    }
}

