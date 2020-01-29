
<template>
  <v-row align="center">
    <v-expansion-panels focusable accordion>
      <v-expansion-panel v-for="(item,i) in bridges" :key="i">
        <v-expansion-panel-header>{{genLabel(item.bridge1, item.bridge2)}}</v-expansion-panel-header>
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
        <v-expansion-panel-header
          class="font-weight-thin blue-grey--text"
        >( Add/Remove Custom Bridge )</v-expansion-panel-header>
        <v-expansion-panel-content>
          You may
          <v-btn text color="primary" @click="addDialog.open = true">Add</v-btn>/
          <v-btn text color="primary" @click="removeDialog.open = true">Remove</v-btn>/
          <v-btn text color="primary" @click="resetBridge">Reset</v-btn>the Merkle Bridge-Asset Pair.
        </v-expansion-panel-content>
      </v-expansion-panel>
    </v-expansion-panels>
    <v-dialog persistent v-model="addDialog.open" max-width="450">
      <v-card>
        <v-card-title>Add the Bridge-Asset Pair</v-card-title>
        <v-card-text
          class="text-left"
        >Select a json file containing pair infomation. (Only .json extension is supported) Add only verified pairs!</v-card-text>
        <v-card-text>
          <v-file-input
            ref="fileInput"
            :rules="[validateBridgeFile]"
            label="File input"
            v-model="addDialog.filePath"
            accept=".json"
            @change="onAddFileChange"
          ></v-file-input>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="primary" @click="addBridge" :disabled="!addDialog.isOk">Add</v-btn>
          <v-btn text @click="addDialog.open = false">Cancel</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-dialog persistent v-model="removeDialog.open" max-width="550">
      <v-card>
        <v-card-title>Remove the Bridge-Asset Pair</v-card-title>
        <v-card-text class="text-left">Select the pair to remove</v-card-text>
        <v-card-text>
          <span v-for="(item,i) in bridges" :key="i">
            <v-checkbox
              class="ma-0 pa-0"
              v-model="removeDialog.selected"
              :label="genLabel(item.bridge1, item.bridge2)"
              :value="i"
            ></v-checkbox>
          </span>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            color="primary"
            @click="removeBridge"
            :disabled="!removeDialog.selected.length"
          >Remove</v-btn>
          <v-btn text @click="removeDialog.open = false">Cancel</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-row>
</template>

<script>
import { defaultBridges, validateBridge } from "./common/DefaultBridges";
import BridgeCard from "./BridgeCard";

export default {
  name: "BridgeSelect",
  components: {
    BridgeCard
  },
  data: () => ({
    bridges: null,
    addDialog: {
      open: false,
      filePath: null,
      fileContent: null,
      isOk: false
    },
    removeDialog: {
      open: false,
      selected: []
    }
  }),
  created() {
    //localStorage.clear(); //FIXME remove this

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
    },
    addBridge() {
      // add to current bridge list
      this.bridges.push(this.addDialog.fileContent);

      // save new bridge list
      localStorage.setItem("_bridges", JSON.stringify(this.bridges));

      //close a dialog
      this.addDialog.open = false;
    },
    onAddFileChange() {
      let reader = new FileReader();

      if (this.addDialog.filePath) {
        reader.onload = () => {
          this.addDialog.fileContent = JSON.parse(reader.result);

          this.$refs.fileInput.validate();
        };
        reader.readAsText(this.addDialog.filePath);
      }
    },
    validateBridgeFile() {
      if (this.addDialog.fileContent) {
        let result = validateBridge(this.addDialog.fileContent);
          
        this.addDialog.isOk = result.valid;
        
        if (result.valid) {
          return true;
        } else {
          return result.errors;
        }
      }
      this.addDialog.isOk = false;
      return true;
    },
    removeBridge() {
      let sortSelected = this.removeDialog.selected.sort();

      // remove bridge selected
      for (var i = sortSelected.length - 1; i >= 0; i--) {
        this.bridges.splice(sortSelected[i], 1);
      }

      // update bridge list
      localStorage.setItem("_bridges", JSON.stringify(this.bridges));

      this.removeDialog.selected = [];
    },
    resetBridge() {
      localStorage.setItem("_bridges", JSON.stringify(defaultBridges));
      this.bridges = JSON.parse(localStorage.getItem("_bridges"));
    },
    genLabel(bridge1, bridge2) {
      return (
        bridge1.net.label +
        "(" +
        bridge1.asset.label +
        ") - " +
        bridge2.net.label +
        "(" +
        bridge2.asset.label +
        ")"
      );
    }
  }
};
</script>

<style>
</style>