<template>
  <v-app
    id="main"
    :style="{ background: $vuetify.theme.themes[theme].background }"
  >
    <v-app-bar app outlined>
      <div class="d-flex align-center">
        <h1>Authorizers PoC Requester</h1>
        <v-btn icon align="start" v-if="wallet">
          <v-icon small color="primary" @click="infoDialog = true">
            mdi-information-outline
          </v-icon>
        </v-btn>
      </div>
      <v-spacer></v-spacer>
      <v-chip v-if="wallet" label large outlined color="primary">
        Wallet Connected: <br />
        {{ wallet }}
      </v-chip>
    </v-app-bar>

    <v-main>
      <dApp
        v-bind:wallet.sync="wallet"
        v-bind:sponsorWallet.sync="sponsorWallet"
      />
    </v-main>
    <v-footer app height="40px" flat color="transparent">
      <v-col class="text-center text-caption" cols="12">
        Powered by Airnode
      </v-col>
    </v-footer>
    <v-dialog max-width="60%" v-model="infoDialog">
      <v-card>
        <v-card-title>
          Authorizers PoC
          <v-spacer></v-spacer>
          <v-btn icon @click="infoDialog = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>
        <v-card-text>
          This is a Proof of Concept that requests random numbers from an API
          that is behind an
          <a href="https://docs.api3.org/airnode/v0.3/" target="_blank">
            Airnode
            <v-icon x-small> mdi-open-in-new </v-icon>
          </a>
          that uses an
          <a
            href="https://docs.api3.org/airnode/v0.3/concepts/authorization.html#authorizers"
            target="_blank"
          >
            Authorizer Contract
            <v-icon x-small> mdi-open-in-new </v-icon>
          </a>
          for Whitelisting. Contracts that haven't paid their subscription fee
          will be rejected.
          <br />
          <br />
          To subscribe for Airnode access, please use our
          <a
            href="http://13.233.252.69/product/api-subscription/"
            target="_blank"
          >
            Mock Webstore
            <v-icon x-small> mdi-open-in-new </v-icon>
          </a>
          to place your order.
          <br />
          <br />
          Authorized responses will be returned by Airnode using the shared
          Sponsor Wallet.
          <br />
        </v-card-text>
        <v-card-text>
          <v-row justify="center">
            <v-col cols="12" md="10">
              <v-text-field
                label="Sponsor Wallet Address"
                outlined
                readonly
                @focus="$event.target.select()"
                dense
                :value="sponsorWallet"
              >
              </v-text-field>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>
    </v-dialog>
  </v-app>
</template>

<script>
import dApp from "./components/dApp";

export default {
  name: "App",

  components: {
    dApp,
  },

  data: () => ({
    wallet: null,
    infoDialog: false,
    sponsorWallet: null,
    //
  }),
  computed: {
    theme() {
      return this.$vuetify.theme.dark ? "dark" : "light";
    },
  },
};
</script>

<style></style>
