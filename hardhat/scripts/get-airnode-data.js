// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
require("dotenv").config();
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
const { ethers } = require("hardhat");
const {
  deriveSponsorWalletAddress,
  deriveAirnodeXpub,
} = require("@api3/airnode-admin");

async function getAirnodeData() {
  // Hardhat always runs the compile task when running scripts with its command
  // line interface.
  //
  // If this script is run directly using `node` you may want to call compile
  // manually to make sure everything is compiled
  // await hre.run('compile');

  const airnodeWallet = new ethers.Wallet.fromMnemonic(
    process.env.AIRNODE_WALLET_MNEMONIC
  );
  // AirnodeWallet Balance

  const airnodeXpub = await deriveAirnodeXpub(airnodeWallet.mnemonic.phrase);

  const sponsorWalletAddress = await deriveSponsorWalletAddress(
    airnodeXpub,
    airnodeWallet.address,
    airnodeWallet.address
  );

  const airnodeData = {
    sponsorWalletAddress,
    airnodeXpub,
    airnodeWallet: airnodeWallet.address,
    privateKey: airnodeWallet.privateKey,
  };
  console.log({ airnodeData });
  return airnodeData;
}

getAirnodeData();

module.exports = { getAirnodeData };
