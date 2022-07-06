const { expect } = require("chai");
const { ethers } = require("hardhat");
const { BigNumber } = require("@ethersproject/bignumber");

describe("Phase 1", function () {

    let contractOwnerProducer, contractAddress;
    let h2p; // Deployed instance

    // Units
    let decimalUnit;

    // Requirements
    // const energyRequired = ethers.FixedNumber.from('55.0000');
    // const waterRequired = ethers.FixedNumber.from('10.9106');

    const energyRequired = 550000;
    const waterRequired = 109106;
    let hydrogenProduced;



    // Burning Variables
    let burnElectrolysis;
    before( async () =>{
        //  Getting list of signers

        [contractOwnerProducer,renewables,waterSupplier,electrolysis] =  await ethers.getSigners();
        const H2P = await ethers.getContractFactory("SUPPLYHYDROGEN");
        h2p  = await H2P.deploy(waterSupplier.address,renewables.address,electrolysis.address);

        // Storing contract address
        contractAddress = h2p.address
    });

    describe('Basic Contract Deployment', () => {

        it('Contract deployed address is not null', async function () {
            expect(h2p.address).not.equal(0);
        });

        it('WATER generator address is correctly deployed', async function () {
            expect(await h2p.WATER_PROVIDER()).equal(waterSupplier.address);
        });

        it('Renewable generator address is correctly deployed', async function () {
            expect(await h2p.RENEWABLES_PROVIDER()).equal(renewables.address);
        });

        it('WATER generator address is correctly deployed', async function () {
            expect(await h2p.FUEL_GENERATOR()).equal(electrolysis.address);
        });

        it('Decimal Value', async function () {
            decimalUnit = ethers.BigNumber.from(await h2p.decimalUnit());
            expect(decimalUnit).equal(10000)
        });
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

        it('Renewables can create tokens', async function () {
            // Todo: Below is will be done after fixing decimal points.
            // Minting
            // await h2p.connect(waterSupplier).mintWater(decimalUnit.mul(waterRequired));
            // await h2p.connect(renewables).mintEnergy(decimalUnit.mul(energyRequired));
            // Transferring
            // await h2p.connect(waterSupplier).safeTransferFrom(waterSupplier.address,electrolysis.address, 0, decimalUnit.mul(1000), '0x0000000000000000000000000000000000000000000000000000000000000000')
            // await h2p.connect(renewables).safeTransferFrom(renewables.address,electrolysis.address, 1, decimalUnit.mul(10000), '0x0000000000000000000000000000000000000000000000000000000000000000')

            // minting and buring.
            // await h2p.connect(electrolysis).mintHydrogen();


            // Minting
            await h2p.connect(waterSupplier).mintWater(waterRequired);
            await h2p.connect(renewables).mintEnergy(energyRequired);

            // Transferring
            await h2p.connect(waterSupplier).safeTransferFrom(waterSupplier.address,electrolysis.address, 0, waterRequired, '0x0000000000000000000000000000000000000000000000000000000000000000')
            await h2p.connect(renewables).safeTransferFrom(renewables.address,electrolysis.address, 1, energyRequired, '0x0000000000000000000000000000000000000000000000000000000000000000')

            // minting and buring.
            await h2p.connect(electrolysis).mintHydrogen();
        });
    });
});