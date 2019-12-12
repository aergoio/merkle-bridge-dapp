<template>
  <div>
    <v-form ref="form" v-model="valid" lazy-validation>
      <v-row class="pa-0 ma-0" align="center">
        <v-combobox
          v-model="receiver"
          :rules="[validateReceiver]"
          :items="loadSuggestItems()"
          label="To Address"
          required
          hide-no-data
          clearable
        ></v-combobox>
        <v-btn color="primary" :disabled="valid === false" @click="search">Search</v-btn>
      </v-row>

      <v-container v-if="verifiedReceiver" class="py-0">
        <v-switch
          v-model="isAutoUpdate"
          class="ma-0 py-0"
          dense
          label="Enable Auto Update (every 10s)"
          @click="enableAutoUpdate"
        ></v-switch>
        <v-row class="title">Bridge Status ({{updateTime}})</v-row>
        <v-row class="body-1">{{verifiedReceiver}}</v-row>
        <v-row>
          <v-col cols="5">
            <v-card class="my-2" sm="1">
              <v-icon>mdi-sack</v-icon>
              <v-icon large>mdi-bank-transfer-in</v-icon>
              <br />
              <span
                :class="(underVerifyAmountDecimalStr !== '0' ? 'blinking': '') + ' display-1 font-weight-bold lime--text'"
              >{{underVerifyAmountDecimalStr}}</span>
              <br />
              <span class="subtitle-1 grey--text">{{fromBridge.asset.label}}</span>
              <v-divider class="mx-4"></v-divider>
              <span class="caption">Under Verification</span>
            </v-card>
          </v-col>
          <v-col cols="2">
            <v-card class="my-2" sm="1">
              <v-icon large>mdi-calendar-clock</v-icon>
              <br />
              <span class="display-1 font-weight-bold red--text blinking">{{nextVerifyBlock}}</span>
              <br />
              <span class="subtitle-1 grey--text">Blocks</span>
              <v-divider class="mx-4"></v-divider>
              <span class="caption">Next Verification</span>
            </v-card>
          </v-col>
          <v-col cols="5">
            <v-card class="my-2" sm="1">
              <v-icon large>mdi-weather-cloudy-arrow-right</v-icon>
              <br />
              <span class="display-1 font-weight-bold green--text">{{verifiedAmountDecimalStr}}</span>
              <br />
              <span class="subtitle-1 grey--text">{{toBridge.asset.label}}</span>
              <v-divider class="mx-4"></v-divider>
              <span class="overline">Verified</span>
            </v-card>
          </v-col>
        </v-row>
      </v-container>
      <v-btn
        color="primary"
        :disabled="(valid === false || verifiedAmountDecimalStr === '0')"
        @click="openDialog = true"
      >Continue</v-btn>
      <v-btn text @click="clickBack">Back</v-btn>
    </v-form>

    <!-- warning dialog -->
    <v-row justify="center">
      <v-dialog persistent v-model="openDialog" max-width="380">
        <v-card>
          <v-card-title class="headline">Caution!</v-card-title>
          <v-card-text v-if="underVerifyAmountDecimalStr !== '0'">
            <b>{{underVerifyAmountDecimalStr}}</b> assets are under verification. Only {{verifiedAmountDecimalStr}} verified assets are transfered.
          </v-card-text>
          <v-card-text>
            <b>{{nextVerifyBlock}}</b>
            next verification block is left. If the next verification time is reached during a next step, a transaction may fail. So leave enough block time to proceed.
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="primary" text @click="clickDialogOk">Ok</v-btn>
            <v-btn text @click="clickDialogCancel">Cancel</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </v-row>
  </div>
</template>

<script>
import { validateAddress, loadReceivers, applyDecimals } from "./common/Utils";
import { ethToAergo, utils, aergoToEth } from "eth-merkle-bridge-js";
import { AergoClient, GrpcWebProvider } from "@herajs/client";
import Web3 from "web3";

export default {
  name: "Status",
  components: {
    //
  },
  props: ["fromBridge", "toBridge"],
  data: () => ({
    receiver: "",
    receiverRules: [v => !!v || "Address is required"],
    valid: false,
    verifiedAmountDecimalStr: "0",
    underVerifyAmountDecimalStr: "0",
    nextVerifyBlock: "0",
    verifiedReceiver: null,
    updateTime: null,
    isAutoUpdate: false,
    autoUpdateIntervalId: null,
    openDialog: false
  }),

  methods: {
    reset() {
      this.verifiedReceiver = null;
      this.verifiedAmountDecimalStr = "0";
      this.underVerifyAmountDecimalStr = "0";
    },
    clickDialogOk() {
      this.$emit(
        "update_finalize_info",
        this.verifiedReceiver,
        this.verifiedAmountDecimalStr
      );

      this.reset();
      this.openDialog = false;
      this.$emit("stepping", "next");
    },
    clickDialogCancel() {
      this.openDialog = false;
    },
    clickBack() {
      this.reset();
      this.$refs.form.resetValidation();

      this.$emit("stepping", 1);
    },
    enableAutoUpdate() {
      if (this.isAutoUpdate) {
        this.autoUpdateIntervalId = setInterval(() => {
          this.search();
        }, 10000);
      } else if (this.autoUpdateIntervalId) {
        clearInterval(this.autoUpdateIntervalId);
      }
    },
    validateReceiver(v) {
      if (this.toBridge) {
        return validateAddress(this.toBridge.net.type, v);
      } else {
        return true;
      }
    },
    search() {
      if (this.$refs.form && this.$refs.form.validate()) {
        var withdrawStatuseQuery;
        var anchorStatusQuery;
        if (
          this.fromBridge.net.type === "ethereum" &&
          this.toBridge.net.type === "aergo"
        ) {
          let herajs = new AergoClient(
            {},
            new GrpcWebProvider({ url: this.toBridge.net.endpoint })
          );

          let web3Full = new Web3(
            new Web3.providers.HttpProvider(this.fromBridge.net.endpoint)
          );
          withdrawStatuseQuery = ethToAergo.unfreezable(
            web3Full,
            herajs,
            this.fromBridge.contract.id,
            this.toBridge.contract.id,
            this.receiver,
            this.fromBridge.asset.id
          );

          anchorStatusQuery = utils.getEthAnchorStatus(
            web3Full,
            herajs,
            this.toBridge.contract.id
          );
        } else if (
          this.fromBridge.net.type === "aergo" &&
          this.toBridge.net.type === "ethereum"
        ) {
          let herajs = new AergoClient(
            {},
            new GrpcWebProvider({ url: this.fromBridge.net.endpoint })
          );

          let web3Full = new Web3(
            new Web3.providers.HttpProvider(this.toBridge.net.endpoint)
          );

          withdrawStatuseQuery = aergoToEth.unlockable(
            web3Full,
            herajs,
            this.toBridge.contract.id,
            this.fromBridge.contract.id,
            this.receiver,
            this.toBridge.asset.id
          );

          anchorStatusQuery = utils.getAergoAnchorStatus(
            web3Full,
            herajs,
            this.toBridge.contract.id
          );
        }

        Promise.all([withdrawStatuseQuery, anchorStatusQuery])
          .then(results => {
            this.updateTime = new Date().toLocaleString();
            // verified asset info
            this.verifiedReceiver = this.receiver;
            this.verifiedAmountDecimalStr = applyDecimals(results[0][0], this.toBridge.asset.decimals, false);
            this.underVerifyAmountDecimalStr = applyDecimals(results[0][1], this.fromBridge.asset.decimals, false);

            // expected anchoring block height
            this.nextVerifyBlock =
              results[1].lastAnchorHeight +
              results[1].tAnchor +
              results[1].tFinal -
              results[1].bestHeight;
          })
          .catch(errs => {
            alert(errs);
            // eslint-disable-next-line
            console.error(errs)
          });
      }
    },
    loadSuggestItems() {
      return loadReceivers();
    }
  }
};
</script>


<style>
.blinking {
  animation: blinkingText 3s infinite;
}
@keyframes blinkingText {
  50% {
    color: transparent;
  }
}
</style>