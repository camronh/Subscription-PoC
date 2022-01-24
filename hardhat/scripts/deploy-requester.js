// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
require("dotenv").config();
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
const hre = require("hardhat");
const fs = require("fs");
const { sponsorRequester } = require("./sponsor-requester");
const path = require("path");

async function main() {
  // Hardhat always runs the compile task when running scripts with its command
  // line interface.
  //
  // If this script is run directly using `node` you may want to call compile
  // manually to make sure everything is compiled
  // await hre.run('compile');

  const contractName = "Requester";

  // We get the contract to deploy
  const Requester = await hre.ethers.getContractFactory(contractName);
  //   console.log(Greeter);
  const requester = await Requester.deploy(
    "0x3B35250Ca54C1Fb8c83D48F21231ef6e4fb9f79D"
  );

  await requester.deployed();
  console.log("Deployed!");

  await sponsorRequester(requester.address);

  fs.copyFileSync(
    path.join(
      __dirname,
      "../artifacts/contracts/" +
        contractName +
        ".sol/" +
        contractName +
        ".json"
    ), //source
    path.join(
      process.cwd(),
      "../frontend/src/contracts/" + contractName + ".json"
    ) // destination
  );

  fs.writeFileSync(
    path.join(process.cwd(), "../frontend/src/contracts/address.json"),
    JSON.stringify({
      address: requester.address,
    })
  );

  console.log(`\n\nRequester deployed to: ${requester.address}\n`);
  console.log(
    `Please visit http://13.233.252.69/ to pay for whitelisting!\n\n`
  );

  //   console.log("Greeter deployed to:", greeter.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
