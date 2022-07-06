/**
 * @type import('hardhat/config').HardhatUserConfig
 */

require('@nomiclabs/hardhat-waffle');
require('hardhat-deploy');

// task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
// //   const accounts = await hre.ethers.getSigners();
// //
// //   for (const account of accounts) {
// //     console.log(account.address);
// //   }
// // });

module.exports = {
  solidity: "0.8.11",
  networks: {
    hardhat: {
      accounts: {
        count: 3250,
      },
    },
  },
};
