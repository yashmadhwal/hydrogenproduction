const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Phase 1", function () {

    let contractOwnerProducer, contractAddress;
    let h2p; // Deployed instance
    let batchOfEnergy;

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
    });

    describe('Production Phase', () => {
        it('Renewables cannot generate Zero Energy', async function () {
            await expect(h2p.connect(renewables).mintEnergy(0)).to.revertedWith('Invalid amount of Energy')
        });

        it('Non authorised renewable energy makers cannot make energy', async function () {
            await expect(h2p.mintEnergy(1000)).to.revertedWith('Not Authorised Access')
        });

        it('Renewables cannot generate Zero Energy', async function () {
            await expect(h2p.connect(waterSupplier).mintWater(0)).to.revertedWith('Invalid amount of Energy')
        });

        it('Non authorised renewable energy makers cannot make energy', async function () {
            await expect(h2p.mintWater(1000)).to.revertedWith('Not Authorised Access')
        });

        it('Renewables can create tokens', async function () {
            // Minting 1000 batches each
            await h2p.connect(waterSupplier).mintWater(1000);
            await h2p.connect(renewables).mintEnergy(1000);

            // Transferring
            await h2p.connect(waterSupplier).safeTransferFrom(waterSupplier.address,electrolysis.address, 0, 1000, '0x0000000000000000000000000000000000000000000000000000000000000000')
            await h2p.connect(renewables).safeTransferFrom(renewables.address,electrolysis.address, 1, 1000, '0x0000000000000000000000000000000000000000000000000000000000000000')

            // minting and buring.
            await h2p.connect(electrolysis).mintHydrogen();
        });

        // it('Batch of energy in circulation: 5000 ', async function () {
        //     expect (await h2p.totalSupply()).to.equal(batchOfEnergy);
        // });
        //
        // it('Only contract owner can mint energy', async function () {
        //     await expect(h2p.connect(electrolysis).mintingEnergy(batchOfEnergy)).to.revertedWith('Ownable: caller is not the owner');
        // });
    });
    //
    // describe('Transferring Energy', () => {
    //     it('Transfer energy to electrolysis ', async function () {
    //         // const tranferUnit = batchOfEnergy/2;
    //         await expect(h2p.transfer(electrolysis.address,batchOfEnergy)).not.reverted
    //     });
    //
    //     it('electrolysis receive less amount of energy to it burns the not received amount', async function () {
    //         burnElectrolysis = batchOfEnergy * (0.05)
    //
    //         await expect(h2p.connect(electrolysis).burn(burnElectrolysis)).not.reverted
    //     });
    //
    //     it('Renewable energy should have zero energy stored', async function () {
    //         expect(await h2p.balanceOf(contractOwnerProducer.address)).to.equal(0);
    //     });
    //
    //     it('Cannot transfer more energy because balance is zero', async function () {
    //         // const tranferUnit = batchOfEnergy/2;
    //         await expect(h2p.transfer(electrolysis.address,batchOfEnergy)).to.revertedWith('ERC20: transfer amount exceeds balance')
    //     });
    //
    //     it('Electrolysis transfers to distributor1 full batch', async function () {
    //         // Getting amount of Energy Electrolysis has
    //         const energyElectrolysis = await h2p.balanceOf(electrolysis.address);
    //         // console.log('energyElectrolysis',energyElectrolysis)
    //         await expect(h2p.connect(electrolysis).transfer(distribution1.address,energyElectrolysis)).not.reverted
    //     });
    //
    //     it('Renewable Generates one more batch while first batch is with distribution1', async function(){
    //         await expect(h2p.mintingEnergy(batchOfEnergy)).not.reverted
    //     });
    //     //
    //     it('Batch of energy in circulation: 10000 minus the burned amount by electrolysis', async function () {
    //         // ToDo: To fined the burned amount
    //         expect (await h2p.totalSupply()).to.equal((batchOfEnergy * 2)-burnElectrolysis);
    //     });
    //
    //     it('New batch is distributed to distributor 2 via electrolysis after burning', async function () {
    //         await expect(h2p.transfer(electrolysis.address,batchOfEnergy)).not.reverted
    //
    //         // That mean it has burned 2 times
    //         await expect(h2p.connect(electrolysis).burn(burnElectrolysis)).not.reverted
    //
    //         //Getting balance of electroolysis
    //         const energyElectrolysis = await h2p.balanceOf(electrolysis.address);
    //
    //         await expect(h2p.connect(electrolysis).transfer(distribution2.address,energyElectrolysis)).not.reverted
    //     });
    //
    //     it(`Fast-forward: Both distributors forward it to despensing stations (1 and 2)`,async function () {
    //         await expect(h2p.connect(distribution1).transfer(dispensing1.address,batchOfEnergy - burnElectrolysis)).not.reverted
    //         await expect(h2p.connect(distribution2).transfer(dispensing2.address,batchOfEnergy - burnElectrolysis)).not.reverted
    //     });
    //
    //     it('Batch of energy in circulation: 10000 minus the burned amount by electrolysis x 2', async function () {
    //         // ToDo: To fined the burned amount
    //         expect (await h2p.totalSupply()).to.equal((batchOfEnergy * 2) - (2 * burnElectrolysis));
    //     });
    //
    //
    //     //
    //     it(`Burning one batch of tokens`,async function () {
    //         await expect(h2p.connect(dispensing1).burn(batchOfEnergy - burnElectrolysis)).not.reverted
    //     });
    //     //
    //     it(`Total supply should reduce by one batch`,async function () {
    //         expect(await h2p.totalSupply()).to.equal(batchOfEnergy - burnElectrolysis)
    //     });
    //     //
    //     it(`Burning last batch of tokens, and total supply in circulation should be zero `,async function () {
    //         await expect(h2p.connect(dispensing2).burn(batchOfEnergy - burnElectrolysis)).not.reverted
    //         expect(await h2p.totalSupply()).to.equal(0)
    //     });
    // });
});