
const hre = require("hardhat");
const {ethers} = require("hardhat");

async function main() {
    // Getting deployment addresses (Signer)
    [contractOwnerProducer,renewables,waterSupplier,electrolysis,fillingStation] =  await ethers.getSigners();

    // We get the contract to deploy
    const H2P = await ethers.getContractFactory("SUPPLYHYDROGEN");
    const h2p  = await H2P.deploy(waterSupplier.address,renewables.address,electrolysis.address);

    await h2p.deployed();

    console.log("SUPPLYHYDROGEN deployed to:", h2p.address);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });