require("dotenv").config();
const hre = require("hardhat");
const airnodeAdmin = require("@api3/airnode-admin");
async function sponsorRequester(requesterAddress) {
  console.log(`Sponsoring Requester...`);
  const mnemonic = process.env.AIRNODE_WALLET_MNEMONIC;
  const providerURL = process.env.Ropsten_PROVIDER_URL;
  //   const requesterAddress = "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0";
  // const rinkebyRrpAddress = "0xC11593B87f258672b8eB02d9A723a429b15E9E03";
  const ropstenRrpAddress = "0x3B35250Ca54C1Fb8c83D48F21231ef6e4fb9f79D";
  // First obtain the contract instance on target chain

  const airnodeRrp = await airnodeAdmin.getAirnodeRrp(providerURL, {
    signer: { mnemonic },
    ropstenRrpAddress,
  });

  const requester = await airnodeAdmin.sponsorRequester(
    airnodeRrp,
    requesterAddress
  );
  console.log(`Sponsored Requester: ${requesterAddress}`);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
// sponsorRequester("0x2279B7A0a67DB372996a5FaB50D91eAA73d2eBe6")
//   .then(() => process.exit(0))
//   .catch((error) => {
//     console.error(error);
//     process.exit(1);
//   });

if (require.main === module) {
  const deployedAddress = require("../../frontend/src/contracts/address.json");
  sponsorRequester(deployedAddress.address);
}

module.exports = {
  sponsorRequester,
};
