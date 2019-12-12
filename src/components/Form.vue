<template>
  <div v-if="bridge">
    <v-list dense>
      <v-list-item class="pa-0">
        <v-list-item-icon class="mr-2">
          <v-icon>mdi-sack</v-icon>
        </v-list-item-icon>
        <v-list-item-content class="text-left">
          <v-list-item-title>Asset Name</v-list-item-title>
          {{bridge.asset.label}}
        </v-list-item-content>
        <v-list-item-content class="text-left" v-show="bridge.asset.id">
          <v-list-item-title>Asset Contract ID</v-list-item-title>
          {{bridge.asset.id}}
        </v-list-item-content>
        <v-btn v-clipboard="bridge.asset.id" icon v-show="bridge.asset.id">
          <v-icon>mdi-content-copy</v-icon>
        </v-btn>
        <v-btn
          v-if="bridge.asset.id"
          icon
          :href="bridge.net.scan + bridge.asset.id"
          target="_blank"
        >
          <v-icon>mdi-launch</v-icon>
        </v-btn>
      </v-list-item>
      <v-list-item class="pa-0">
        <v-list-item-icon class="mr-2">
          <v-icon>mdi-bank</v-icon>
        </v-list-item-icon>
        <v-list-item-content class="text-left">
          <v-list-item-title>Bridge Contract ID</v-list-item-title>
          {{bridge.contract.id}}
        </v-list-item-content>
        <v-btn v-clipboard="bridge.contract.id" icon>
          <v-icon>mdi-content-copy</v-icon>
        </v-btn>
        <v-btn icon :href="bridge.net.scan + bridge.contract.id" target="_blank">
          <v-icon>mdi-launch</v-icon>
        </v-btn>
      </v-list-item>
    </v-list>

    <!-- display logined wallet info -->
    <v-form ref="form" v-model="valid" lazy-validation>
      <v-text-field
        v-model="wallet.address"
        :label="inout==='in'? 'From Address' : 'Operator Address'"
        :rules="[validateAccount]"
        disabled
        required
        :class="wallet.isLogin?'':'errored--disable-textfield'"
      >
        <template v-slot:prepend>
          <v-img
            v-if="wallet.type === 'aergo'"
            :src="require('../assets/aergoicon.png')"
            width="24"
          ></v-img>
          <v-img
            v-else-if="wallet.type === 'ethereum'"
            :src="require('../assets/metamask.png')"
            width="24"
          ></v-img>
        </template>
      </v-text-field>
      <div v-if="inout === 'in'">
        <v-text-field
          v-model="receiver"
          :rules="[validateReceiver]"
          :label="'To Address (' + toBridge.net.label + ')'"
          prepend-inner-icon="mdi-account"
          required
          clearable
        ></v-text-field>

        <v-text-field
          v-model="amountDecimals"
          :rules="[validateAmount]"
          :label="'Amount (' + bridge.asset.label +')'"
          required
          clearable
          prepend-inner-icon="mdi-currency-usd"
        >
          <span slot="append" v-if="needApproveToken">
            &nbsp; / {{ approvedAmountDecimalsStr }} Approved
            <v-tooltip v-model="showApproveTooltip" bottom color="red">
              <template v-slot:activator="{ on }">
                <v-btn icon v-on="on">
                  <v-icon @click="clickApproveIcon">mdi-import</v-icon>
                </v-btn>
              </template>
              <span>Increase Approval</span>
            </v-tooltip>
            <v-icon @click="updateApprovedAmount" class="ma-0 pa-0">mdi-refresh</v-icon>
          </span>
        </v-text-field>
      </div>
      <div v-else-if="inout === 'out'">
        <!-- receiver and amount are fixed at finalization -->
        <v-text-field
          v-model="verifiedReceiver"
          :rules="[validateReceiver]"
          :label="'To Address (' + toBridge.net.label + ')'"
          prepend-inner-icon="mdi-account"
          required
          disabled
        ></v-text-field>
        <v-text-field
          v-model="verifiedAmountWithFeeDecimalsStr"
          :rules="[validateAmount]"
          :label="'Amount (' + bridge.asset.label +')'"
          prepend-inner-icon="mdi-currency-usd"
          required
          disabled
          :class="verifiedAmountWithFeeDecimalsStr <= 0 ? 'errored--disable-textfield' : ''"
        >
          <span
            slot="append"
            v-if="bridge && (verifiedAmountWithFeeDecimalsStr !== verifiedAmountDecimalStr)"
            class="blinking"
          > (Operator Fee is Applied)</span>
        </v-text-field>
      </div>
    </v-form>
    <v-btn color="primary" :disabled="valid === false" @click="clickSend">Send {{this.optype}} Tx</v-btn>
    <v-btn text @click="clickBack">Back</v-btn>

    <!-- send result dialog -->
    <v-row justify="center">
      <v-dialog persistent v-model="sendDialog.open" max-width="380">
        <v-card>
          <v-card-title class="headline">Send Tx: {{sendDialog.status}}</v-card-title>
          <v-card-text>{{sendDialog.message}}</v-card-text>
          <v-card-text>
            <a
              v-if="sendDialog.blockHash"
              :href="bridge.net.scan + sendDialog.blockHash"
              target="_blank"
            >{{sendDialog.blockHash}}</a>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn
              :loading="sendDialog.status===this.WAIT"
              color="primary"
              text
              @click="clickSendDialogOk"
            >Ok</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </v-row>
    <!-- increase approve dialog -->
    <v-row justify="center">
      <v-dialog persistent v-model="approveDialog.open" max-width="380">
        <v-card>
          <v-card-title>Request Approval: {{approveDialog.status}}</v-card-title>
          <v-card-text>{{approveDialog.message}}</v-card-text>
          <v-card-text>
            <a
              v-if="approveDialog.blockHash"
              :href="bridge.net.scan + approveDialog.blockHash"
              target="_blank"
            >{{approveDialog.blockHash}}</a>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <div v-if="approveDialog.status===NONE">
              <v-btn
                text
                @click="clickApproveDialogOk"
                color="primary"
                :loading="approveDialog.status===this.WAIT"
              >Send Approve Tx</v-btn>
              <v-btn
                text
                :disabled="approveDialog.status===this.WAIT"
                @click="approveDialog.open=false"
              >Cancel</v-btn>
            </div>
            <div v-else>
              <v-btn
                text
                :loading="approveDialog.status===this.WAIT"
                @click="clickApproveDialogClose"
              >Close</v-btn>
            </div>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </v-row>
  </div>
</template>

<script>
import { ethToAergo, aergoToEth, utils } from "eth-merkle-bridge-js"; //aergoToEth
import { web3 } from "./common/Web3Loader";
import {
  validateAddress,
  saveReceiver,
  sendTxToAergoConnect,
  applyDecimals
} from "./common/Utils";
import { assetType } from "./common/DefaultBridges";
import { AergoClient, GrpcWebProvider, Amount } from "@herajs/client";

export default {
  name: "Form",
  props: [
    "fromBridge",
    "toBridge",
    "optype",
    "etheraccount",
    "aergoaccount",
    "verifiedReceiver",
    "verifiedAmountDecimalStr"
  ],
  components: {},
  data: () => ({
    valid: false,
    receiver: "",
    amountDecimals: "",
    verifiedAmountWithFeeDecimalsStr: "0",
    approvedAmount: new Amount(0),
    checkApprovedAmount: true,
    showApproveTooltip: false,
    sendDialog: {
      open: false,
      status: "",
      message: "",
      blockHash: ""
    },
    approveDialog: {
      open: false,
      status: "",
      message: "",
      blockHash: ""
    }
  }),
  created() {
    this.NONE = "";
    this.WAIT = "WAIT CONFIRM";
    this.SUCCESS = "SUCCESS";
    this.FAIL = "FAIL";
  },
  computed: {
    amount: function() {
      return new Amount(
        applyDecimals(this.amountDecimals, this.bridge.asset.decimals, true)
      );
    },
    approvedAmountDecimalsStr: function() {
      return applyDecimals(
        this.approvedAmount,
        this.bridge.asset.decimals,
        false
      );
    },
    inout: function() {
      if (
        this.optype === "burn" ||
        this.optype === "lock" ||
        this.optype === "freeze"
      ) {
        return "in";
      } else if (
        this.optype === "mint" ||
        this.optype === "unlock" ||
        this.optype === "unfreeze"
      ) {
        return "out";
      } else {
        return "";
      }
    },
    needApproveToken: function() {
      if (
        this.inout === "in" &&
        this.fromBridge.asset.type !== assetType.native
      ) {
        return true;
      } else {
        return false;
      }
    },
    bridge: function() {
      if (this.inout === "in") {
        return this.fromBridge;
      } else if (this.inout === "out") {
        return this.toBridge;
      } else {
        return null;
      }
    },
    wallet: function() {
      if (this.bridge) {
        if (this.bridge.net.type === "aergo" && this.aergoaccount) {
          if (this.aergoaccount.chainId === this.bridge.net.chainId) {
            return {
              isLogin: true,
              address: this.aergoaccount.address,
              err: "",
              type: this.bridge.net.type
            };
          }
          return {
            isLogin: false,
            address: this.aergoaccount.address,
            err: "The account's chainId is different with the bridge's",
            type: this.bridge.net.type
          };
        } else if (this.bridge.net.type === "ethereum" && this.etheraccount) {
          if (this.etheraccount.selectedAddress) {
            if (
              this.etheraccount.networkVersion ===
              this.bridge.net.networkVersion
            ) {
              return {
                isLogin: true,
                address: this.etheraccount.selectedAddress,
                err: "",
                type: this.bridge.net.type
              };
            }

            return {
              isLogin: false,
              address: this.etheraccount.selectedAddress,
              err:
                "The account's network version is different with the bridge's" +
                this.etheraccount.networkVersion,
              type: this.bridge.net.type
            };
          } else {
            return {
              isLogin: false,
              address: this.etheraccount.selectedAddress,
              err: "Click metamask icon at toolbar to connect this DApp",
              type: this.bridge.net.type
            };
          }
        } else {
          // logged out
          if (this.bridge.net.type === "aergo") {
            return {
              isLogin: false,
              address: "",
              err: "Login to aergo connect",
              type: this.bridge.net.type
            };
          } else {
            return {
              isLogin: false,
              address: "",
              err: "Login to Metamask",
              type: this.bridge.net.type
            };
          }
        }
      } else {
        return {
          isLogin: false,
          address: "",
          err: "Bridge is Not Initialized",
          type: ""
        };
      }
    }
  },
  methods: {
    async handleResult(dialog, receipt, msg) {
      dialog.status = this.WAIT;
      dialog.blockHash = null;
      dialog.message = msg;
      dialog.open = true;
      try {
        const response = await receipt;

        dialog.status = this.SUCCESS;
        dialog.message =
          "The transaction has been confirmed and included in block; ";
        if (this.bridge.net.type === "aergo") {
          dialog.blockHash = response.blockhash;
        } else {
          dialog.blockHash = response.blockHash;
        }
      } catch (err) {
        dialog.status = this.FAIL;
        dialog.message = err;
      }
    },
    clickApproveIcon() {
      this.checkApprovedAmount = false;
      if (this.$refs.form.validate()) {
        this.approveDialog.status = this.NONE;
        this.approveDialog.open = true; //open dialog and ask
        this.approveDialog.message =
          "Do you approve that " +
          applyDecimals(
            this.amount.sub(this.approvedAmount),
            this.bridge.asset.decimals,
            false
          ) +
          " " +
          this.fromBridge.asset.label +
          " is used by bridge contract?";
      } else if (!this.wallet.isLogin) {
        this.$emit("needLogin", true, this.bridge.net.type);
      }
      this.checkApprovedAmount = true;
    },
    async clickApproveDialogOk() {
      if (this.fromBridge.net.type === "ethereum") {
        // wait until transaction finished
        await this.handleResult(
          this.approveDialog,
          ethToAergo.increaseApproval(
            web3,
            this.fromBridge.contract.id, //spender
            this.amount.sub(this.approvedAmount).formatNumber(), //necessary amount
            this.fromBridge.asset.id, //erc20addr
            this.fromBridge.asset.abi //erc20abi
          ),
          "wating approve tx confirm. you can check a tx in the wallet."
        );
      }
    },
    clickApproveDialogClose() {
      this.updateApprovedAmount();
      this.approveDialog.open = false;
    },
    async clickSend() {
      this.showApproveTooltip = false;
      if (this.$refs.form.validate()) {
        this.sendDialog.status = this.NONE;
        if (this.optype === "lock") {
          // wait until transaction finished
          await this.handleResult(
            this.sendDialog,
            // send lock request to ethereum
            ethToAergo.lock(
              web3,
              this.receiver,
              this.fromBridge.asset.id,
              this.amount.formatNumber(),
              this.fromBridge.contract.id,
              this.fromBridge.contract.abi
            ),
            "lock tx description"
          );
        } else if (this.optype === "unlock") {
          // wait until transaction finished
          await this.handleResult(
            this.sendDialog,
            // send lock request to ethereum
            aergoToEth.unlock(
              web3,
              new AergoClient(
                {},
                new GrpcWebProvider({ url: this.fromBridge.net.endpoint })
              ),
              this.toBridge.contract.id,
              this.toBridge.contract.abi,
              this.fromBridge.contract.id,
              this.verifiedReceiver,
              this.toBridge.asset.id
            ),
            "unlock tx description"
          );
        } else if (this.optype == "unfreeze") {
          let builtTx = await ethToAergo.buildUnfreezeTx(
            web3,
            new AergoClient(
              {},
              new GrpcWebProvider({ url: this.toBridge.net.endpoint })
            ),
            this.wallet.address,
            this.fromBridge.contract.id,
            this.toBridge.contract.id,
            this.toBridge.contract.abi,
            this.verifiedReceiver,
            this.fromBridge.asset.id
          );
          await this.handleResult(
            this.sendDialog,
            sendTxToAergoConnect(
              this.toBridge.net.endpoint,
              this.toBridge.contract.id,
              builtTx
            ),
            "unfreeze description"
          );
        } else if (this.optype == "freeze") {
          let builtTx = await aergoToEth.buildFreezeTx(
            this.wallet.address,
            this.amount.formatNumber(),
            this.fromBridge.contract.id,
            this.fromBridge.contract.abi,
            this.receiver
          );
          await this.handleResult(
            this.sendDialog,
            sendTxToAergoConnect(
              this.fromBridge.net.endpoint,
              this.fromBridge.contract.id,
              builtTx
            ),
            "freeze description"
          );
        }
      } else {
        if (!this.wallet.isLogin) {
          this.$emit("needLogin", true, this.bridge.net.type);
        }
      }
    },
    clickBack() {
      this.showApproveTooltip = false;
      this.$refs.form.resetValidation();
      this.$emit("needLogin", false, this.bridge.net.type);
      this.$emit("stepping", "prev");
    },
    clickSendDialogOk() {
      this.sendDialog.open = false;
      if (this.sendDialog.status === this.SUCCESS) {
        this.$emit("stepping", "next");
        // update localstorage
        saveReceiver(this.receiver);
      }
    },
    validateReceiver(v) {
      if (this.toBridge) {
        return validateAddress(this.toBridge.net.type, v);
      } else {
        return true;
      }
    },
    validateAccount() {
      if (this.wallet.isLogin) {
        this.$emit("needLogin", false, this.bridge.net.type);

        return true;
      } else {
        return this.wallet.err;
      }
    },
    validateAmount(v) {
      if (!v) {
        return "Amount is required";
      } else if (
        new Amount(applyDecimals(v, this.bridge.asset.decimals, true)).compare(
          0
        ) <= 0
      ) {
        return "Amount must be bigger than 0";
      } else if (false === /^\d+(\.?\d*)$/.test(v)) {
        return "Amount must be real number";
      } else if (
        this.checkApprovedAmount &&
        this.needApproveToken &&
        new Amount(applyDecimals(v, this.bridge.asset.decimals, true)).compare(
          this.approvedAmount
        ) > 0 // value must be bigger than already approved amount
      ) {
        this.showApproveTooltip = true;
        return (
          "Approved Asset Amount is Insufficient (Current Approval = " +
          applyDecimals(
            this.approvedAmount,
            this.bridge.asset.decimals,
            false
          ) +
          ")"
        );
      }
      return true;
    },
    updateApprovedAmount() {
      if (this.bridge && this.inout === "in" && this.wallet.isLogin) {
        if (this.$refs.form) {
          this.$refs.form.resetValidation();
        }
        if (this.fromBridge.asset.type === "erc20") {
          // define contract
          let assetContract = new web3.eth.Contract(
            this.fromBridge.asset.abi,
            this.fromBridge.asset.id
          );
          // call allowance of erc20
          assetContract.methods
            .allowance(this.wallet.address, this.fromBridge.contract.id)
            .call()
            .then(approved => {
              this.approvedAmount = new Amount(approved.toString());
            });
        } else {
          //TODO for ARC1
          this.approvedAmount = new Amount(0);
        }
      }
    },
    async updateUnfreezeFee() {
      if (
        this.wallet.isLogin &&
        this.verifiedReceiver.toUpperCase() !==
          this.wallet.address.toUpperCase() &&
        this.optype === "unfreeze"
      ) {
        let herajs = new AergoClient(
          {},
          new GrpcWebProvider({ url: this.toBridge.net.endpoint })
        );
        const unfreezeFee = await utils.getAergoUnfreezeFee(
          herajs,
          this.toBridge.contract.id
        );
        this.verifiedAmountWithFeeDecimalsStr = applyDecimals(
          new Amount(
            applyDecimals(
              new Amount(this.verifiedAmountDecimalStr),
              this.bridge.asset.decimals,
              true
            )
          ).sub(new Amount(unfreezeFee)),
          this.bridge.asset.decimals,
          false
        );
      } else {
        this.verifiedAmountWithFeeDecimalsStr = this.verifiedAmountDecimalStr;
      }
    }
  },
  watch: {
    "wallet.address": async function() {
      // this updates approved amount
      this.updateApprovedAmount();
      // this updates unfreezefee
      this.updateUnfreezeFee();
    },
    verifiedAmountDecimalStr: async function() {
      this.updateUnfreezeFee();
    }
  }
};
</script>

<style>
.errored--disable-textfield .theme--light.v-messages {
  color: red !important;
}
.errored--disable-textfield .v-label {
  color: red !important;
}
</style>