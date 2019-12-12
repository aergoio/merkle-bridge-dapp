
<template>
  <v-row align="center">
    <v-expansion-panels focusable accordion>
      <v-expansion-panel v-for="(item,i) in bridges" :key="i">
        <v-expansion-panel-header>{{item.bridge1.net.label}}({{item.bridge1.asset.label}}) - {{item.bridge2.net.label}}({{item.bridge2.asset.label}})</v-expansion-panel-header>
        <v-expansion-panel-content>
          <v-container fluid class="pa-0">
            <v-row>
              <v-col sm12 md6>
                <BridgeCard
                  v-bind:fromBridge="item.bridge1"
                  v-bind:toBridge="item.bridge2"
                  @select_bridge="select_bridge"
                />
              </v-col>
              <v-col xs12 sm6>
                <BridgeCard
                  v-bind:fromBridge="item.bridge2"
                  v-bind:toBridge="item.bridge1"
                  @select_bridge="select_bridge"
                />
              </v-col>
            </v-row>
          </v-container>
        </v-expansion-panel-content>
      </v-expansion-panel>
      <v-expansion-panel>
        <v-expansion-panel-header>( ... or Add/Remove Custom Bridge)</v-expansion-panel-header>
        <v-expansion-panel-content>TODO add/remove bridge</v-expansion-panel-content>
      </v-expansion-panel>
    </v-expansion-panels>
  </v-row>
</template>

<script>
import {defaultBridges} from "./common/DefaultBridges";
import BridgeCard from "./BridgeCard";

export default {
  name: "BridgeSelect",
  components: {
    BridgeCard
  },
  data: () => ({
    bridges: null
  }),
  created() {
    localStorage.clear(); //FIXME remove this

    // set initail bridge configuration
    if (localStorage.getItem("_bridges") === null) {
      localStorage.setItem("_bridges", JSON.stringify(defaultBridges));
    }
    this.bridges = JSON.parse(localStorage.getItem("_bridges"));
  },
  methods: {
    select_bridge(from, fromOpType, to, toOpType, inout) {
      this.$emit("select_bridge", from, fromOpType, to, toOpType);
      if (inout === "in") {
        this.$emit("stepping", "next");
      } else {
        this.$emit("stepping", 3);
      }
    }
  }
};
</script>

<style>
</style>