<template>
  <div id="app">
    <v-app>
      <!-- navigation menu -->
      <v-navigation-drawer v-model="drawer" absolute temporary>
        <v-list-item @click="step=1; menu='transfer'; drawer=false;">
          <v-list-item-avatar>
            <v-icon large>mdi-bank-transfer-in</v-icon>
          </v-list-item-avatar>
          <v-list-item-content>Transfer Asset</v-list-item-content>
        </v-list-item>
        <!--
        <v-list-item @click="step=1; menu='navigate'; drawer=false;">
          <v-list-item-avatar>
            <v-icon large>mdi-search-web</v-icon>
          </v-list-item-avatar>
          <v-list-item-content>Navigate</v-list-item-content>
        </v-list-item>
        -->
      </v-navigation-drawer>
      <AccountToolBar
        v-bind:isLoginNeeded="isLoginNeeded"
        v-bind:isLoginNeededNetType="isLoginNeededNetType"
        @login_ethereum="login_ethereum"
        @login_aergo="login_aergo"
        @open_drawer="open_drawer"
        @stepping="stepping"
      />
      <v-content class="pa-0" align-center style="min-width: 400px; max-width: 1000px">
        <v-stepper v-model="step" vertical>
          <v-stepper-step :complete="step > 1" step="1">
            <v-row no-gutters>
              <v-col>
                Select a bridge
                <br />
                <small>Choose paired assets, transfer direction and steps</small>
              </v-col>
              <v-col v-if="this.step != 1 && this.toBridge !== null && this.fromBridge !== null">
                {{fromBridge.net.label}}({{fromBridge.asset.label}})  <v-icon small>mdi-arrow-right</v-icon>  {{toBridge.net.label}}({{toBridge.asset.label}})
              </v-col>
            </v-row>
          </v-stepper-step>
          <v-stepper-content step="1">
            <BridgeSelect @select_bridge="select_bridge" @stepping="stepping" />
          </v-stepper-content>

          <div v-if="menu==='transfer'">
            <v-stepper-step :complete="step > 2" step="2">
              Send an asset
              <small>On source network, transfer assets to the Merkle Bridge</small>
            </v-stepper-step>
            <v-stepper-content step="2">
              <Form
                v-bind:fromBridge="fromBridge"
                v-bind:toBridge="toBridge"
                v-bind:optype="fromOpType"
                v-bind:etheraccount="etheraccount"
                v-bind:aergoaccount="aergoaccount"
                v-bind:verifiedReceiver="verifiedReceiver"
                v-bind:verifiedAmountDecimalStr="verifiedAmountDecimalStr"
                @needLogin="needLogin"
                @stepping="stepping"
              />
            </v-stepper-content>

            <v-stepper-step :complete="step > 3" step="3">
              Check if verified
              <small>Check the source network's transmission state on the target network's Merkle Bridge</small>
            </v-stepper-step>
            <v-stepper-content step="3">
              <Status
                v-bind:toBridge="toBridge"
                v-bind:fromBridge="fromBridge"
                v-bind:optype="fromOpType"
                @stepping="stepping"
                @update_finalize_info="update_finalize_info"
              />
              <br />
            </v-stepper-content>

            <v-stepper-step :complete="step > 4" step="4">
              Receive the asset
              <small>On target network, withdraw assets from the Merkle Bridge</small>
            </v-stepper-step>
            <v-stepper-content step="4">
              <Form
                v-bind:fromBridge="fromBridge"
                v-bind:toBridge="toBridge"
                v-bind:optype="toOpType"
                v-bind:etheraccount="etheraccount"
                v-bind:aergoaccount="aergoaccount"
                v-bind:verifiedReceiver="verifiedReceiver"
                v-bind:verifiedAmountDecimalStr="verifiedAmountDecimalStr"
                @needLogin="needLogin"
                @stepping="stepping"
              />
            </v-stepper-content>
          </div>

          <div v-else-if="menu==='navigate'">
            <v-stepper-step :complete="step > 2" step="2">Navigate asset transfers</v-stepper-step>
            <v-stepper-content step="2">
              <History />
            </v-stepper-content>
          </div>
          <div v-if="step > 4">
            The asset has been transfered successfully.
            <br />To send another asset, click the button below.
            <br />
            <br />
            <v-btn @click="step=1" color="primary">Select Bridge</v-btn>
          </div>
        </v-stepper>
      </v-content>
    </v-app>
  </div>
</template>

<script>
import AccountToolBar from "./components/AccountToolBar";
import BridgeSelect from "./components/BridgeSelect";
import Form from "./components/Form";
import Status from "./components/Status";
import History from "./components/History";

export default {
  name: "App",
  components: {
    AccountToolBar,
    BridgeSelect,
    Status,
    Form,
    History
  },
  data: () => ({
    step: 1,
    drawer: null,
    menu: "transfer",
    fromBridge: null,
    toBridge: null,
    fromOpType: null,
    toOpType: null,
    verifiedReceiver: "",
    verifiedAmountDecimalStr: 0,
    isLoginNeeded: false,
    isLoginNeededNetType: "",
    etheraccount: null,
    aergoaccount: null,
    st: "",
    tmpText: ""
  }),
  methods: {
    login_ethereum(etheraccount) {
      this.etheraccount = etheraccount;
    },
    login_aergo(aergoaccount) {
      this.aergoaccount = aergoaccount;
    },
    open_drawer() {
      this.drawer = !this.drawer;
    },
    select_bridge(fromBridge, fromOpType, toBridge, toOpType) {
      this.fromBridge = fromBridge;
      this.toBridge = toBridge;
      this.fromOpType = fromOpType;
      this.toOpType = toOpType;
    },
    update_finalize_info(verifiedReceiver, verifiedAmountDecimalStr) {
      this.verifiedReceiver = verifiedReceiver;
      this.verifiedAmountDecimalStr = verifiedAmountDecimalStr;
    },
    needLogin(isLoginNeeded, isLoginNeededNetType) {
      this.isLoginNeeded = isLoginNeeded;
      this.isLoginNeededNetType = isLoginNeededNetType;
    },
    stepping(step) {
      if (step === "next") {
        this.step = this.step + 1;
      } else if (step === "prev") {
        this.step = this.step - 1;
      } else {
        this.step = step;
      }
    }
  }
};
</script>


<style>
#app {
  font-family: sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #ff0097;
  margin-top: 60px;
}
</style>