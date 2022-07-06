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

    // set decimal value
    uint public decimalUnit = 1e4; //10000

    // required Units
    uint public waterRequired = 109106;
    uint public electricityRequired = 550000;

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

        uint _balanceWater = h2Token.balanceOf(msg.sender,WATER);
        console.log('Balance of water in gallons', _balanceWater);

        uint _balanceEnergy = h2Token.balanceOf(msg.sender,RENEWABLES);
        console.log('Balance of energy in KwH', _balanceEnergy);

        require( _balanceWater >= waterRequired, 'Not enough Water!');
        require( _balanceEnergy >= electricityRequired, 'Not enough Energy!');

        // todo: Correct H2 Formula to check (require statement)
        // Minimum require gallons of water:  2.4 Gallons of water, i.e. 10.9106 Liter
        // Updated Version:
        uint maxWater = _balanceWater / waterRequired;
        //        console.log('_balanceWater', _balanceWater);
        //        console.log('waterRequired', waterRequired);
        //        console.log('maxWater', maxWater);

        uint maxEnergy = _balanceEnergy / electricityRequired;
        //        console.log('_balanceEnergy', _balanceEnergy);
        //        console.log('electricityRequired', electricityRequired);
        //        console.log('maxEnergy', maxEnergy);


        uint hydrogenProduction;

        if (maxWater >= maxEnergy){
            hydrogenProduction = maxEnergy;
        }
        else {
            hydrogenProduction = maxWater;
        }

        uint hydrogenProduced = hydrogenProduction * decimalUnit;

        uint waterConsumed = maxWater * waterRequired;
        uint electricityConsumed = maxEnergy * electricityRequired;


        _mint(msg.sender, HYDROGEN_FUEL, hydrogenProduced , "");
        _burn(msg.sender, WATER, waterConsumed);
        _burn(msg.sender, RENEWABLES, electricityConsumed);

        console.log('hydrogenProduction',hydrogenProduced);

        uint _balanceWater1 = h2Token.balanceOf(msg.sender,WATER);
        console.log('Balance of water in gallons', _balanceWater1);
        uint _balanceEnergy1 = h2Token.balanceOf(msg.sender,RENEWABLES);
        console.log('Balance of energy in gallons', _balanceEnergy1);
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

