<template>
  <v-container>
    <br />
    <v-row justify="center" align="center">
      <v-col cols="12" md="9">
        <v-card elevation="10">
          <v-card-text>
            <v-card-title>
              <v-spacer></v-spacer>
              <template v-if="walletConnected">
                Gas Wallet Balance: {{ balanceString }} ETH
              </template>
            </v-card-title>

            <v-card-text align="center" justify="center">
              <v-sheet v-if="!walletConnected">
                <v-btn @click="connectWallet" outlined color="primary">
                  Connect Your Wallet
                </v-btn>
              </v-sheet>
              <v-sheet v-else>
                <v-row>
                  <v-col cols="12" md="3"></v-col>
                  <v-col cols="12" md="6">
                    <v-card outlined>
                      <v-card-text>
                        <v-card-title>Request a Random Number</v-card-title>
                        <v-col cols="12" md="7">
                          <v-text-field
                            label="Max Number"
                            type="number"
                            outlined
                            v-model="max"
                          >
                          </v-text-field
                        ></v-col>

                        <v-btn
                          @click="makeRequest"
                          outlined
                          :disabled="loading"
                          color="primary"
                        >
                          Make Request
                        </v-btn>
                      </v-card-text>
                    </v-card>
                  </v-col>
                  <v-col cols="12" md="3"></v-col>
                </v-row>
              </v-sheet>
            </v-card-text>
            <v-card-actions v-if="walletConnected">
              <v-spacer></v-spacer>

              <v-spacer></v-spacer>
            </v-card-actions>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
    <br />
    <br />
    <v-textarea
      label="Request Logs"
      v-if="requestStarted"
      color="primary"
      readonly
      dense
      filled
      :value="logText"
      style="font-family: 'Courier New'"
      :loading="loading"
    />
    <v-dialog v-model="sponsorWalletDialog" max-width="60%">
      <v-card>
        <v-card-title>
          Sponsor Wallet Top Up Required
          <v-spacer></v-spacer>
          <v-btn icon @click="sponsorWalletDialog = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>
        <v-card-text>
          <v-alert type="error" outlined>
            The Sponsor Wallet for this requester contract is empty. Please
            provide enough gas for Airnode to put it's response on chain.
          </v-alert>
        </v-card-text>

        <v-card-text justify="center" align="center">
          Sponsor Wallet Address: {{ sponsorWalletAddress }}</v-card-text
        >
        <v-card-text>
          <v-row justify="center">
            <v-col cols="12" md="3">
              <v-text-field
                label="Amount"
                outlined
                dense
                :disabled="fundingSponsorWallet"
                suffix="ETH"
                v-model="fundAmount"
                type="number"
              ></v-text-field>
            </v-col>
            <v-col cols="12" md="3">
              <v-btn
                :disabled="fundAmount <= 0"
                @click="fundSponsorWallet"
                :loading="fundingSponsorWallet"
              >
                Fund
              </v-btn>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>
    </v-dialog>
    <v-dialog max-width="60%" v-model="infoDialog">
      <v-card>
        <v-card-title>
          Snowflake PoC
          <v-spacer></v-spacer>
          <v-btn icon @click="infoDialog = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>
        <v-card-text>
          This is a Proof of Concept that shows how to make SQL queries to the
          Snowflake DB from a Smart Contract using
          <a href="https://docs.api3.org/airnode/v0.3/" target="_blank">
            Airnode
            <v-icon x-small> mdi-open-in-new </v-icon>
          </a>

          . Users can bet on their prediction of cases tomorrow against cases
          today. Airnode will fetch the latest cases from the Snowflake DB and
          store them on chain.
          <br />
          <br />
          Snowflake DB allows us to query
          <a href="https://covid19.who.int/table" target="_blank">
            WHO Daily Report
            <v-icon x-small> mdi-open-in-new </v-icon>
          </a>
          data. In this case we are querying the global "Cases - newly reported
          in last 7 days"
        </v-card-text>
        <v-card-text>
          The SQL query hardcoded into the contract is:
          <br />
          <code>
            SELECT SUM(CASES_TOTAL_PER_100000) AS CASES FROM WHO_DAILY_REPORT
            WHERE COUNTRY_REGION IS NOT NULL;
          </code>
        </v-card-text>
        <v-card-text>
          <v-row>
            <v-col cols="12" md="6">
              <v-text-field
                label="Sponsor Wallet Address"
                outlined
                readonly
                @focus="$event.target.select()"
                class="address"
                dense
                :value="sponsorWalletAddress"
              >
              </v-text-field>
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field
                label="House Wallet Address"
                outlined
                color="primary"
                dense
                class="address"
                @focus="$event.target.select()"
                readonly
                :value="requesterAddress"
              >
              </v-text-field>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script>
import { ethers } from "ethers";
export default {
  name: "dApp",

  data: () => ({
    walletConnected: false,
    provider: null,
    signer: null,
    address: null,
    chainId: null,
    requestStarted: false,
    loading: false,
    logText: "",
    endpointId:
      "0xb46d3c17506312cf4b8c8a6248ba4610617e9628a9fd93389805db7986c96c29",
    airnodeWalletAddress: "0xCAc663035857b707aDF58674fA276C2aA74765BA",
    sponsorWalletAddress: "0x6946F59A800873D24979EFA240E5B3e3a64D32EE",
    sponsorWalletBalance: 0,
    sponsorWalletDialog: false,
    infoDialog: false,
    fundingSponsorWallet: false,
    airnodeRrp: null,
    fundAmount: 0.01,
    max: 100,
  }),
  computed: {
    requesterAddress() {
      try {
        const json = require("../contracts/address.json");
        return json.address;
      } catch (error) {
        console.log(error);
        return error;
      }
    },
    requesterAbi() {
      const requesterArtifacts = require("../contracts/Requester.json");
      return requesterArtifacts.abi;
    },
    rrpAbi() {
      const airnodeProtocol = require("@api3/airnode-protocol");
      const rrpArtifacts = airnodeProtocol.AirnodeRrpFactory;
      return rrpArtifacts.abi;
    },

    balanceString() {
      return Number(this.sponsorWalletBalance).toFixed(4);
    },

    RRPAddress() {
      switch (Number(this.chainId)) {
        case 31337:
          return "0x5FbDB2315678afecb367f032d93F642f64180aa3";
        case 4:
          return "0xC11593B87f258672b8eB02d9A723a429b15E9E03";
        default:
          return "0x3B35250Ca54C1Fb8c83D48F21231ef6e4fb9f79D";
      }
    },
  },
  methods: {
    async connectWallet() {
      try {
        this.provider = new ethers.providers.Web3Provider(
          window.ethereum,
          "any"
        );
        // Prompt user for account connections
        await this.provider.send("eth_requestAccounts", []);
        this.signer = this.provider.getSigner();
        this.address = await this.signer.getAddress();
        const network = await this.provider.getNetwork();
        this.chainId = network.chainId;
        console.log("Account:", this.address);
        this.walletConnected = true;
        this.requesterContract = new ethers.Contract(
          this.requesterAddress,
          this.requesterAbi,
          this.signer
        );

        this.sponsorWalletBalance = await this.provider.getBalance(
          this.sponsorWalletAddress
        );

        this.sponsorWalletBalance = ethers.utils.formatEther(
          this.sponsorWalletBalance,
          { pad: true }
        );

        // make this.sponsorWalletBalance 4 digits

        this.airnodeRrp = new ethers.Contract(
          this.RRPAddress,
          this.rrpAbi,
          this.signer
        );
        this.checkSponsorWallet();
        // Connect ethers to metamask
        console.log("Done!");
        this.$emit("update:wallet", this.address);
        this.$emit("update:sponsorWallet", this.sponsorWalletAddress);
      } catch (error) {
        console.log(error);
        this.provider = null;
        this.signer = null;
        this.address = null;
        this.chainId = null;
        this.walletConnected = false;
      }
    },
    checkSponsorWallet() {
      const wei = ethers.utils.parseEther(this.sponsorWalletBalance);
      if (wei <= 500000000000000) {
        this.sponsorWalletDialog = true;
        return false;
      } else return true;
    },
    async fundSponsorWallet() {
      this.fundingSponsorWallet = true;
      try {
        const tx = await this.signer.sendTransaction({
          to: this.sponsorWalletAddress,
          value: ethers.utils.parseEther(`${this.fundAmount}`),
        });
        // Wait for tx to be mined
        await tx.wait();
        await this.connectWallet();
        this.sponsorWalletDialog = false;
      } catch (error) {
        console.log(error);
      }
      this.fundingSponsorWallet = false;
    },
    async makeRequest() {
      if (!this.checkSponsorWallet()) return;

      this.loading = true;
      this.requestStarted = true;
      try {
        this.printToLog("Making Airnode Request...");

        const { provider, airnodeRrp, requesterContract } = this;

        const airnodeAbi = require("@api3/airnode-abi");
        const requestParams = [
          { name: "_type", type: "bytes32", value: "string" },
          { name: "_path", type: "bytes32", value: "randomNumber" },
          { name: "max", type: "int256", value: this.max },
        ];

        const receipt = await requesterContract.makeRequest(
          this.airnodeWalletAddress,
          this.endpointId,
          this.airnodeWalletAddress,
          this.sponsorWalletAddress,
          airnodeAbi.encode(requestParams)
        );

        // Wait until the transaction is mined
        const requestId = await new Promise((resolve) =>
          provider.once(receipt.hash, (tx) => {
            const parsedLog = airnodeRrp.interface.parseLog(tx.logs[0]);
            resolve(parsedLog.args.requestId);
          })
        );

        this.printToLog("Airnode request made!");
        this.printToLog("RequestId: " + requestId);
        this.printToLog("Waiting for Airnode to respond...");

        await new Promise((resolve) =>
          provider.once(
            airnodeRrp.filters.FulfilledRequest(null, requestId),
            resolve
          )
        );

        // const encodedData = await this.requesterContract.encodedData(requestId);
        const decodedData = await this.requesterContract.decodedData(requestId);
        // this.printToLog(`Encoded Data: \n${encodedData}`);
        this.printToLog(`Random Number: \n${decodedData}`);

        console.log({ decodedData });
      } catch (error) {
        this.printToLog(error.message);
      }
      this.loading = false;
    },
    printToLog(message) {
      this.logText += `${message}\n`;
    },
  },
};
</script>

<style scoped>
/* Make the .amount bigger */
.amount {
  font-size: 1.5rem;
}
.address {
  font-size: 0.95em;
}
.v-textarea textarea {
  line-height: 400px;
}
</style>
