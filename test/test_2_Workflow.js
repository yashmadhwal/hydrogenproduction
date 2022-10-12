const { expect } = require("chai");
const { ethers } = require("hardhat");
const { BigNumber } = require("@ethersproject/bignumber");

describe("Workflow", function () {

    let contractOwnerProducer, contractAddress;
    let h2p; // Deployed instance

    // Units
    let decimalUnit;


    // Requirements
    // const energyRequired = ethers.FixedNumber.from('55.0000');
    // const waterRequired = ethers.FixedNumber.from('10.9106');

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

    before( async () =>{
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

    describe('Production Phase', () => {
        it('Renewables cannot generate Zero Energy', async function () {
            await expect(h2p.connect(renewables).mintEnergy(decimalUnit.mul(0))).to.revertedWith('Invalid amount of Energy')
        });

        it('Non authorised renewable energy makers cannot make energy', async function () {
            await expect(h2p.mintEnergy(decimalUnit.mul(energyRequired))).to.revertedWith('Not Authorised Access')
        });

        it('Renewables cannot generate Zero Energy', async function () {
            await expect(h2p.connect(waterSupplier).mintWater(decimalUnit.mul(0))).to.revertedWith('Invalid amount of Energy')
        });

        it('Non authorised renewable energy makers cannot make energy', async function () {
            await expect(h2p.mintWater(decimalUnit.mul(waterRequired))).to.revertedWith('Not Authorised Access')
        });


        it(`Renewables to create 28000 kgs of H2
            1. Minting as per requirements
            2. Minting
            3. Transferring
            4. Checking Balance water and renewables after transferring, should be Zero
            5. Minting H2
            6. Checking Balance of H2
                    `, async function () {
            // Minting as per requirements
            const waterRequiredForStation = waterRequired.mul(28000)
            const electricityRequiredForStation = energyRequired.mul(28000)

            // Minting
            await h2p.connect(waterSupplier).mintWater(waterRequiredForStation);
            await h2p.connect(renewables).mintEnergy(electricityRequiredForStation);

            // Transferring
            await h2p.connect(waterSupplier).safeTransferFrom(waterSupplier.address,electrolysis.address, indexWATER, waterRequiredForStation, '0x0000000000000000000000000000000000000000000000000000000000000000')
            await h2p.connect(renewables).safeTransferFrom(renewables.address,electrolysis.address, indexRENEWABLES, electricityRequiredForStation, '0x0000000000000000000000000000000000000000000000000000000000000000')

            // Checking balance of Water and Renewables, Both should be 0 after transferring and balance of the hydro station should be amount transferred.
            expect(await h2p.balanceOf(waterSupplier.address,indexWATER)).to.equal(0);
            expect(await h2p.balanceOf(renewables.address,indexRENEWABLES)).to.equal(0);

            expect(await h2p.balanceOf(electrolysis.address,indexWATER)).to.equal(waterRequiredForStation);
            expect(await h2p.balanceOf(electrolysis.address,indexRENEWABLES)).to.equal(electricityRequiredForStation);

            // Minting H2 and buring.
            await h2p.connect(electrolysis).mintHydrogen();
            expect(await h2p.balanceOf(electrolysis.address,indexWATER)).to.equal(0);
            expect(await h2p.balanceOf(electrolysis.address,indexRENEWABLES)).to.equal(0);
            expect(await h2p.balanceOf(electrolysis.address,indexHYDROGEN_FUEL)).to.equal(280000000);

        });

        it('Transferring to Filling Station, and checking Balance equal 280000000 (28000.0000)', async function () {
            // Getting balance of electrolysis
            const electrolysisHydrodenReserve = await h2p.balanceOf(electrolysis.address,indexHYDROGEN_FUEL);
            await h2p.connect(electrolysis).safeTransferFrom(electrolysis.address,fillingStation.address, indexHYDROGEN_FUEL, electrolysisHydrodenReserve, '0x0000000000000000000000000000000000000000000000000000000000000000');

            // Balance of electrolysis is 0
            expect(await h2p.balanceOf(electrolysis.address,indexHYDROGEN_FUEL)).to.equal(0);

            // Getting Balance of filling station
            const hydrogenFillingStation = await h2p.balanceOf(fillingStation.address,indexHYDROGEN_FUEL);
            expect(hydrogenFillingStation).equal(280000000)
        });
    });
});