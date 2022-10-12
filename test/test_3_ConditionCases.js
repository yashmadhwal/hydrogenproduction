const { expect } = require("chai");
const { ethers } = require("hardhat");
const { BigNumber } = require("@ethersproject/bignumber");

describe("Workflow", function () {
    let contractOwnerProducer, contractAddress;
    let h2p; // Deployed instance

    // Units
    let decimalUnit;

    const energyRequired = ethers.BigNumber.from(550000);
    const waterRequired = ethers.BigNumber.from(109106);
    let hydrogenProduced;

    // Entities
    let renewables;
    let fillingStation

    // Index Units
    let indexWATER
    let indexRENEWABLES
    let indexHYDROGEN_FUEL

    // Burning Variables
    let burnElectrolysis;

    beforeEach( async () =>{
        //  Getting list of signers
        [contractOwnerProducer,renewables,waterSupplier,electrolysis,fillingStation] =  await ethers.getSigners();
        const H2P = await ethers.getContractFactory("SUPPLYHYDROGEN");
        h2p  = await H2P.deploy();

        // decimalUnit
        decimalUnit = ethers.BigNumber.from(await h2p.decimalUnit());

        // Indexes
        indexWATER = await h2p.WATER();
        indexRENEWABLES = await h2p.RENEWABLES();
        indexHYDROGEN_FUEL = await h2p.HYDROGEN_FUEL();

        // Asserting
        await h2p.setWaterProvider(waterSupplier.address);
        await h2p.setEnergyProvider(renewables.address);
        await h2p.setFuelProvider(electrolysis.address);

        // Storing contract address
        contractAddress = h2p.address
    });

    describe('Case Specific Workflow ', () => {
        it('All balances, etc should be at initial state', async function () {
            // Checking everything is in the initial state
            expect(await h2p.balanceOf(waterSupplier.address,indexWATER)).to.equal(0);
            expect(await h2p.balanceOf(renewables.address,indexRENEWABLES)).to.equal(0);
            expect(await h2p.balanceOf(electrolysis.address,indexRENEWABLES)).to.equal(0);
        });

        it(` producing 1 kg (10000) of H2:
        1. Minting: water: 109106; electricity: 550000
        2. Transfering 
        3. Minting H2 = 1kg (10000 units)
        4. Balance of electricity at electrolysis should be 0 and balance of water at electrolysis should be 0
        `, async function () {
            // Checking everything is in the initial state
            expect(await h2p.balanceOf(waterSupplier.address,indexWATER)).to.equal(0);
            expect(await h2p.balanceOf(renewables.address,indexRENEWABLES)).to.equal(0);
            expect(await h2p.balanceOf(electrolysis.address,indexRENEWABLES)).to.equal(0);

            // Minting
            const waterRequiredForStation = waterRequired.mul(1)
            const electricityRequiredForStation = energyRequired.mul(1)
            await h2p.connect(waterSupplier).mintWater(waterRequiredForStation);
            await h2p.connect(renewables).mintEnergy(electricityRequiredForStation);

            // Transferring
            await h2p.connect(waterSupplier).safeTransferFrom(waterSupplier.address,electrolysis.address, indexWATER, waterRequiredForStation, '0x0000000000000000000000000000000000000000000000000000000000000000')
            await h2p.connect(renewables).safeTransferFrom(renewables.address,electrolysis.address, indexRENEWABLES, electricityRequiredForStation, '0x0000000000000000000000000000000000000000000000000000000000000000')

            // Minting H2
            await h2p.connect(electrolysis).mintHydrogen();
            expect(await h2p.balanceOf(electrolysis.address,indexHYDROGEN_FUEL)).to.equal(10000);

            //    Checking balance at electrolysis
            expect(await h2p.balanceOf(electrolysis.address,indexWATER)).to.equal(0);
            expect(await h2p.balanceOf(electrolysis.address,indexRENEWABLES)).to.equal(0);
        });

        it(` producing 1 kg (10000) of H2:
        1. But Minting: water: 2 x 109106; electricity: 550000
        2. Transfering all the units
        3. Minting H2 = 1kg (10000 units)
        4. Balance of electricity at electrolysis should be 0 and balance of water at electrolysis should be 109106
        `, async function () {
            // Checking everything is in the initial state
            expect(await h2p.balanceOf(waterSupplier.address,indexWATER)).to.equal(0);
            expect(await h2p.balanceOf(renewables.address,indexRENEWABLES)).to.equal(0);
            expect(await h2p.balanceOf(electrolysis.address,indexRENEWABLES)).to.equal(0);

            // Minting
            const waterRequiredForStation = waterRequired.mul(2)
            const electricityRequiredForStation = energyRequired.mul(1)
            await h2p.connect(waterSupplier).mintWater(waterRequiredForStation);
            await h2p.connect(renewables).mintEnergy(electricityRequiredForStation);

            // Transferring
            await h2p.connect(waterSupplier).safeTransferFrom(waterSupplier.address,electrolysis.address, indexWATER, waterRequiredForStation, '0x0000000000000000000000000000000000000000000000000000000000000000')
            await h2p.connect(renewables).safeTransferFrom(renewables.address,electrolysis.address, indexRENEWABLES, electricityRequiredForStation, '0x0000000000000000000000000000000000000000000000000000000000000000')

            // Minting H2
            await h2p.connect(electrolysis).mintHydrogen();
            expect(await h2p.balanceOf(electrolysis.address,indexHYDROGEN_FUEL)).to.equal(10000);

            //    Checking balance at electrolysis
            expect(await h2p.balanceOf(electrolysis.address,indexWATER)).to.equal(waterRequired);
            expect(await h2p.balanceOf(electrolysis.address,indexRENEWABLES)).to.equal(0);
        });
    });
});