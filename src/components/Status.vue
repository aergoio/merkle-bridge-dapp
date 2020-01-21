<template>
  <div v-if="toBridge">
    <v-form ref="form" v-model="valid" lazy-validation>
      <v-row align="center" no-gutters>
        <v-col>
          <v-text-field
            v-model="receiver"
            :rules="[validateReceiver]"
            :label="'To Address (' + toBridge.net.label + ')'"
            required
            clearable
          ></v-text-field>
        </v-col>
        <v-col md="auto">
          <v-btn color="primary" :disabled="valid === false" @click="search">
            <span v-if="verifiedReceiver">Update</span>
            <span v-else>Search</span>
          </v-btn>
        </v-col>
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
          <v-col cols="4">
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
              <span class="overline">Under Verification</span>
            </v-card>
          </v-col>
          <v-col cols="4">
            <v-card class="my-2" sm="1">
              <v-icon large>mdi-calendar-clock</v-icon>
              <br />
              <span class="display-1 font-weight-bold red--text blinking">{{nextVerifyBlock}}</span>
              <br />
              <span class="subtitle-1 grey--text">Blocks</span>
              <v-divider class="mx-4"></v-divider>
              <span class="overline">Next Verification</span>
            </v-card>
          </v-col>
          <v-col cols="4">
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
            <b>{{underVerifyAmountDecimalStr}}</b>
            assets are under verification. Only {{verifiedAmountDecimalStr}} verified assets will be transfered.
          </v-card-text>
          <v-card-text>
            <b>{{nextVerifyBlock}}</b>
            blocks left until next verification. Make sure there is enough time for TX to be confirmed before proceeding to the next step. If the verification happens in the middle of the next step and the state changes, the current TX can fail.
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
import {
  validateAddress,
  applyDecimals,
  getEthNextVerifyToReceiver,
  getAergoNextVerifyToReceiver
} from "./common/Utils";
import { ethToAergo, aergoToEth } from "eth-merkle-bridge-js";
import { AergoClient, GrpcWebProvider } from "@herajs/client";
import Web3 from "web3";

export default {
  name: "Status",
  components: {
    //
  },
  props: ["fromBridge", "toBridge", "optype"],
  data: () => ({
    receiver: "",
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
        var nextVerifyQuery;

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

          nextVerifyQuery = getEthNextVerifyToReceiver(
            web3Full,
            herajs,
            this.fromBridge.contract.id,
            this.fromBridge.contract.abi,
            this.toBridge.contract.id,
            this.optype,
            this.receiver
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

          nextVerifyQuery = getAergoNextVerifyToReceiver(
            web3Full,
            herajs,
            this.fromBridge.contract.id,
            this.toBridge.contract.id,
            this.optype,
            this.receiver
          );
        }

        Promise.all([withdrawStatuseQuery, nextVerifyQuery])
          .then(results => {
            this.updateTime = new Date().toLocaleString();
            // verified asset info
            this.verifiedReceiver = this.receiver;
            this.verifiedAmountDecimalStr = applyDecimals(
              results[0][0],
              this.toBridge.asset.decimals,
              false
            );
            this.underVerifyAmountDecimalStr = applyDecimals(
              results[0][1],
              this.fromBridge.asset.decimals,
              false
            );

            // expected anchoring block height
            if (this.underVerifyAmountDecimalStr !== "0") {
              this.nextVerifyBlock = results[1][0];
            } else {
              this.nextVerifyBlock = results[1][1];
            }
          })
          .catch(errs => {
            alert("The state is being processed. Please try again in a few minutes.");
            // eslint-disable-next-line
            console.error(errs);
          });
      }
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