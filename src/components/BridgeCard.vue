<template>
  <v-card class="mx-auto" min-width="350px">
    <v-card-text class="pa-1">
      <v-container fluid pa-0>
        <v-row>
          <v-col class="py-0">
            <v-btn text @click="showMeta=!showMeta">
              {{fromBridge.net.label}}
              <v-icon small>mdi-arrow-right</v-icon>
              {{toBridge.net.label}}
              <v-icon>mdi-menu-down</v-icon>
            </v-btn>
          </v-col>
        </v-row>
        <v-row>
          <v-col class="py-0">
            <p v-show="showMeta === true" align="left" class="px-5">
              From Asset:
              <a
                v-if="fromBridge.asset.id"
                :href="fromBridge.net.scan + fromBridge.asset.id"
                target="_blank"
              >{{fromBridge.asset.id}}</a>
              <span v-else>{{fromBridge.asset.label}}</span>
              <br />From Bridge:
              <a
                :href="fromBridge.net.scan + fromBridge.contract.id"
                target="_blank"
              >{{fromBridge.contract.id}}</a>
              <br />To Asset:
              <a
                v-if="toBridge.asset.id"
                :href="toBridge.net.scan + toBridge.asset.id"
                target="_blank"
              >{{toBridge.asset.id}}</a>
              <span v-else>{{toBridge.asset.label}}</span>

              <br />To Bridge:
              <a
                :href="toBridge.net.scan + toBridge.contract.id"
                target="_blank"
              >{{toBridge.contract.id}}</a>
            </p>
          </v-col>
        </v-row>
        <v-row>
          <v-col class="px-0">
            <v-icon>mdi-sack</v-icon>
            <v-icon large>mdi-bank-transfer-in</v-icon>
            <br />
            <v-btn color="primary" text @click="emitSelection('in');">
              <small>
                1. {{getOpType('in', fromBridge)}}
                <br />
                {{fromBridge.asset.label}}
              </small>
            </v-btn>
          </v-col>
          <v-col class="px-0">
            <v-icon large>mdi-weather-cloudy-arrow-right</v-icon>
            <br />
            <v-btn color="primary" text @click="emitSelection('out');">
              <small>
                2. Wait
                <br />Verification
              </small>
            </v-btn>
          </v-col>
          <v-col class="px-0">
            <v-icon large>mdi-bank-transfer-out</v-icon>
            <v-icon>mdi-sack</v-icon>
            <br />
            <v-btn color="primary" text @click="emitSelection('out');">
              <small>
                3. {{getOpType('out', toBridge)}}
                <br />
                {{toBridge.asset.label}}
              </small>
            </v-btn>
          </v-col>
        </v-row>
      </v-container>
    </v-card-text>
  </v-card>
</template>

<script>
import { assetType } from "./common/DefaultBridges";

export default {
  name: "BridgeCard",
  props: ["fromBridge", "toBridge"],
  components: {
    //
  },
  data: () => ({
    showMeta: false
  }),
  methods: {
    getOpType(inOut, bridge) {
      if (inOut === "in") {
        if (
          bridge.asset.type === assetType.erc20 ||
          bridge.asset.type === assetType.arc1
        ) {
          if (bridge.asset.isPegged === true) {
            return "burn";
          } else {
            return "lock";
          }
        } else if (bridge.asset.type === assetType.native) {
          return "freeze";
        } else {
          /* eslint-disable no-console */
          console.error("unsuppored asset type", bridge.asset.type);
        }
      } else if (inOut === "out") {
        if (
          bridge.asset.type === assetType.erc20 ||
          bridge.asset.type === assetType.arc1
        ) {
          if (bridge.asset.isPegged === true) {
            return "mint";
          } else {
            return "unlock";
          }
        } else if (bridge.asset.type === assetType.native) {
          return "unfreeze";
        } else {
          /* eslint-disable no-console */
          console.error("unsuppored asset type", bridge.asset.type);
        }
      } else {
        /* eslint-disable no-console */
        console.error("unsuppored inOut value", inOut);
      }
    },
    emitSelection(inout) {
      this.$emit(
        "select_bridge",
        this.fromBridge,
        this.getOpType("in", this.fromBridge),
        this.toBridge,
        this.getOpType("out", this.toBridge),
        inout
      );
    }
  }
};
</script>


<style>
a {
  text-decoration: none;
}
</style>