const { expect } = require("chai");
const { ethers } = require("hardhat");
const { BigNumber } = require("@ethersproject/bignumber");

describe("Basic Smart Contract Testing", function () {

    let contractOwnerProducer, contractAddress;
    let h2p; // Deployed instance

    // Units
    let decimalUnit;

    const energyRequired = 550000;
    const waterRequired = 109106;
    let hydrogenProduced;

    // Burning Variables
    let burnElectrolysis;
    before( async () =>{
        //  Getting list of signers

        [contractOwnerProducer,renewables,waterSupplier,electrolysis, ...tempAddress] =  await ethers.getSigners();
        const H2P = await ethers.getContractFactory("SUPPLYHYDROGEN");
        // h2p  = await H2P.deploy(waterSupplier.address,renewables.address,electrolysis.address);
        h2p  = await H2P.deploy();

        // Storing contract address
        contractAddress = h2p.address
    });

    describe('Basic Contract Deployment', () => {

        it('Contract deployed address is not null', async function () {
            expect(h2p.address).not.equal(0);
        });

        it('WATER generator address is Null', async function () {
            expect(await h2p.WATER_PROVIDER()).equal('0x0000000000000000000000000000000000000000');
        });

        it('Renewable generator address is Null', async function () {
            expect(await h2p.RENEWABLES_PROVIDER()).equal('0x0000000000000000000000000000000000000000');
        });

        it('WATER generator address is Null', async function () {
            expect(await h2p.FUEL_GENERATOR()).equal('0x0000000000000000000000000000000000000000');
        });

        it('Decimal Value', async function () {
            decimalUnit = ethers.BigNumber.from(await h2p.decimalUnit());
            expect(decimalUnit).equal(10000)
        });
    });

    describe('Initialising the Roles', () => {
        it('Transaction Fails as No initialization for all roles', async function () {
            await expect(h2p.mintEnergy(decimalUnit.mul(energyRequired))).to.revertedWith('Not Authorised Access')
            await expect(h2p.mintWater(decimalUnit.mul(0))).to.revertedWith('Not Authorised Access')
            await expect(h2p.mintHydrogen()).to.revertedWith('Not Authorised Access')
        });

        it('Only owner can set roles', async function () {
            await expect(h2p.connect(tempAddress[0]).setWaterProvider(tempAddress[1].address)).to.revertedWith('Ownable: caller is not the owner');
            await expect(h2p.connect(tempAddress[0]).setEnergyProvider(tempAddress[2].address)).to.revertedWith('Ownable: caller is not the owner');
            await expect(h2p.connect(tempAddress[0]).setFuelProvider(tempAddress[3].address)).to.revertedWith('Ownable: caller is not the owner');
        });

        it('Cannot set null address as Roles', async function () {
            await h2p.setWaterProvider(tempAddress[1].address);
            expect (await h2p.WATER_PROVIDER()).equal(tempAddress[1].address);

            await h2p.setEnergyProvider(tempAddress[2].address);
            expect (await h2p.RENEWABLES_PROVIDER()).equal(tempAddress[2].address);

            await h2p.setFuelProvider(tempAddress[3].address);
            expect (await h2p.FUEL_GENERATOR()).equal(tempAddress[3].address);
        });

        it('Setting Roles and verifying the information', async function () {
            await h2p.setWaterProvider(tempAddress[1].address);
            expect (await h2p.WATER_PROVIDER()).equal(tempAddress[1].address);

            await h2p.setEnergyProvider(tempAddress[2].address);
            expect (await h2p.RENEWABLES_PROVIDER()).equal(tempAddress[2].address);

            await h2p.setFuelProvider(tempAddress[3].address);
            expect (await h2p.FUEL_GENERATOR()).equal(tempAddress[3].address);
        });

        it('Able to change the roles and verifying the information', async function () {
            await h2p.setWaterProvider(waterSupplier.address);
            expect (await h2p.WATER_PROVIDER()).equal(waterSupplier.address);

            await h2p.setEnergyProvider(renewables.address);
            expect (await h2p.RENEWABLES_PROVIDER()).equal(renewables.address);

            await h2p.setFuelProvider(electrolysis.address);
            expect (await h2p.FUEL_GENERATOR()).equal(electrolysis.address);
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
            // Minting
            await h2p.connect(waterSupplier).mintWater(waterRequired);
            await h2p.connect(renewables).mintEnergy(energyRequired);

            // Transferring
            await h2p.connect(waterSupplier).safeTransferFrom(waterSupplier.address,electrolysis.address, 0, waterRequired, '0x0000000000000000000000000000000000000000000000000000000000000000')
            await h2p.connect(renewables).safeTransferFrom(renewables.address,electrolysis.address, 1, energyRequired, '0x0000000000000000000000000000000000000000000000000000000000000000')

            // minting and buring.
            await h2p.connect(electrolysis).mintHydrogen();
        });

        it('When Roles are changed, the new entities can mint but previous cannot', async function () {
            // changing roles
            await h2p.setWaterProvider(tempAddress[1].address);
            expect (await h2p.WATER_PROVIDER()).equal(tempAddress[1].address);

            await h2p.setEnergyProvider(tempAddress[2].address);
            expect (await h2p.RENEWABLES_PROVIDER()).equal(tempAddress[2].address);

            await h2p.setFuelProvider(tempAddress[3].address);
            expect (await h2p.FUEL_GENERATOR()).equal(tempAddress[3].address);

            //
            // Minting with error
            await expect(h2p.connect(waterSupplier).mintWater(waterRequired)).to.revertedWith('Not Authorised Access');
            await expect(h2p.connect(renewables).mintEnergy(energyRequired)).to.revertedWith('Not Authorised Access');

            // Minting
            await h2p.connect(tempAddress[1]).mintWater(waterRequired);
            await h2p.connect(tempAddress[2]).mintEnergy(energyRequired);

            // Transferring
            await h2p.connect(tempAddress[1]).safeTransferFrom(tempAddress[1].address,tempAddress[3].address, 0, waterRequired, '0x0000000000000000000000000000000000000000000000000000000000000000')
            await h2p.connect(tempAddress[2]).safeTransferFrom(tempAddress[2].address,tempAddress[3].address, 1, energyRequired, '0x0000000000000000000000000000000000000000000000000000000000000000')
            //
            // minting and buring.
            await h2p.connect(tempAddress[3]).mintHydrogen();
        });
    });
});