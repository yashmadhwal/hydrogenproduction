// SPDX-License-Identifier: MIT
pragma solidity ^0.8.16;

// ________________ ERC 1155 _________________________
import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/token/ERC1155/IERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "hardhat/console.sol";

contract SUPPLYHYDROGEN is ERC1155,Ownable {
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
    uint public waterRequired;
    uint public electricityRequired; //55.0000

    constructor() ERC1155("") {
        h2Token = IERC1155(address(this));

        // Initial Values
        waterRequired = 109106; // 10.9106
        electricityRequired = 550000; //55.0000
    }

    function setWaterRequirement(uint _waterRequired) public onlyElectrolyser{
        require(_waterRequired != 0,'Minimum amount cannot be zero');
        waterRequired = _waterRequired;
    }

    function setElectricityRequirement(uint _electricityRequired) public onlyElectrolyser{
        require(_electricityRequired != 0,'Minimum amount cannot be zero');
        electricityRequired = _electricityRequired;
    }

    function setWaterProvider(address _water) public onlyOwner{
        require(_water != address(0),'The Address cannot be null');
        WATER_PROVIDER = _water;
    }

    function setEnergyProvider(address _energy) public onlyOwner{
        require(_energy != address(0),'The Address cannot be null');
        RENEWABLES_PROVIDER = _energy;
    }

    function setFuelProvider(address _fuel) public onlyOwner{
        require(_fuel != address(0),'The Address cannot be null');
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

    function _min(uint maxWater, uint maxEnergy) private pure returns(uint){
        return maxWater <= maxEnergy ? maxWater: maxEnergy;
    }

    function mintHydrogen() public onlyElectrolyser{

        uint _balanceWater = h2Token.balanceOf(msg.sender,WATER);
        uint _balanceEnergy = h2Token.balanceOf(msg.sender,RENEWABLES);

        require( _balanceWater >= waterRequired, 'Not enough Water!');
        require( _balanceEnergy >= electricityRequired, 'Not enough Energy!');

        uint maxWater = _balanceWater / waterRequired;
        uint maxEnergy = _balanceEnergy / electricityRequired;
        uint hydrogenProduction;

//        if (maxWater >= maxEnergy){
//            hydrogenProduction = maxEnergy;
//        }
//        else {
//            hydrogenProduction = maxWater;
//        }

        hydrogenProduction = _min(maxWater, maxEnergy);

        uint hydrogenProduced = hydrogenProduction * decimalUnit;

        uint waterConsumed = hydrogenProduction * waterRequired;
        uint electricityConsumed = hydrogenProduction * electricityRequired;

        _mint(msg.sender, HYDROGEN_FUEL, hydrogenProduced , "");
        _burn(msg.sender, WATER, waterConsumed);
        _burn(msg.sender, RENEWABLES, electricityConsumed);
    }

    modifier onlyRenewable(){
        require(msg.sender == RENEWABLES_PROVIDER, 'Not Authorised Access');
        _;
    }

    modifier onlyWater(){
        require(msg.sender == WATER_PROVIDER, 'Not Authorised Access');
        _;
    }

    modifier onlyElectrolyser(){
        require(msg.sender == FUEL_GENERATOR, 'Not Authorised Access');
        _;
    }
}

