<template>
  <div>
    <v-app-bar app color="#ff0097" dark>
      <v-app-bar-nav-icon @click.stop="$emit('open_drawer');"></v-app-bar-nav-icon>

      <!-- title on toolbar -->
      <v-toolbar-title>Aergo to Ethereum Merkle Bridge</v-toolbar-title>
      <v-spacer></v-spacer>
      <!-- aergo accoount button -->
      <v-menu bottom right transition="scale-transition" origin="top left">
        <template v-slot:activator="{ on }">
          <span v-if="isLoginNeededNetType==='aergo' && isLoginNeeded===true">
            <v-btn fab color="white" v-on="on">
              <v-img
                class="blinking"
                :src="require('../assets/aergoicon.png')"
                contain
                width="30"
                height="30"
              ></v-img>
            </v-btn>
          </span>
          <span v-else>
            <v-btn icon v-on="on">
              <v-img :src="require('../assets/aergoicon.png')" contain width="30" height="30"></v-img>
            </v-btn>
          </span>
        </template>
        <v-card>
          <!-- not logged in to aergo connect -->
          <v-list v-if="this.aergoaccount === null">
            <v-list-item>
              <v-list-item-avatar>
                <v-img :src="require('../assets/aergoicon.png')"></v-img>
              </v-list-item-avatar>
              <v-list-item-content>
                <v-list-item-title>Aergo Connect</v-list-item-title>
                <v-btn color="primary" @click="getAergoActiveAccount">Login</v-btn>
              </v-list-item-content>
            </v-list-item>
          </v-list>
          <!-- on logged in to aergo connect -->
          <v-list v-else>
            <v-list-item>
              <v-list-item-avatar>
                <v-img :src="require('../assets/aergoicon.png')"></v-img>
              </v-list-item-avatar>
              <v-list-item-content>
                <v-list-item-title>Logged In</v-list-item-title>
                <v-list-item-subtitle>{{this.aergoaccount.address}}</v-list-item-subtitle>
              </v-list-item-content>
              <v-btn text icon @click="getAergoActiveAccount">
                <v-icon>mdi-refresh</v-icon>
              </v-btn>
            </v-list-item>
          </v-list>
        </v-card>
      </v-menu>

      <!-- ethereum accoount button -->
      <v-menu bottom right transition="scale-transition" origin="top left">
        <template v-slot:activator="{ on }">
          <span v-if="isLoginNeededNetType==='ethereum' && isLoginNeeded===true">
            <v-btn fab color="white" v-on="on">
              <v-img
                class="blinking"
                :src="require('../assets/metamask.png')"
                contain
                width="30"
                height="30"
              ></v-img>
            </v-btn>
          </span>
          <span v-else>
            <v-btn icon v-on="on">
              <v-img :src="require('../assets/metamask.png')" contain width="30" height="30"></v-img>
            </v-btn>
          </span>
        </template>
        <v-card>
          <!-- not logged in to aergo connect -->
          <v-list>
            <v-list-item>
              <v-list-item-avatar>
                <v-img :src="require('../assets/metamask.png')"></v-img>
              </v-list-item-avatar>
              <v-list-item-content>
                <span v-if="this.etheraccount === null">
                  <v-list-item-title>Logged Out</v-list-item-title>
                  <v-list-item-subtitle>Login to Metamask</v-list-item-subtitle>
                </span>
                <span v-else-if="this.etheraccount.isUnlocked === false">
                  <v-list-item-title>Locked</v-list-item-title>
                  <v-list-item-subtitle>Unlock Metamask</v-list-item-subtitle>
                </span>
                <span v-else-if="this.etheraccount.selectedAddress === null">
                  <v-list-item-title>Metamask</v-list-item-title>
                  <v-btn color="primary" @click="connectMetamask">Connect DApp</v-btn>
                </span>
                <!-- on logged in to metamask-->
                <span v-else>
                  <v-list-item-title>Logged In</v-list-item-title>
                  <v-list-item-subtitle>{{this.etheraccount.selectedAddress}}</v-list-item-subtitle>
                </span>
              </v-list-item-content>
            </v-list-item>
          </v-list>
        </v-card>
      </v-menu>
    </v-app-bar>
  </div>
</template>

<script>
import { web3 , updateDefaultAccount} from "./common/Web3Loader";

export default {
  name: "AccountToolBar",
  props: ["isLoginNeeded", "isLoginNeededNetType"],
  components: {},
  data: () => ({
    etheraccount: null,
    aergoaccount: null,
    
    aergoapi: null,
    drawer: null
  }),
  created() {
    /* eslint-disable */ 
    console.log(web3.currentProvider);
    // set ethereum account change listener
    web3.currentProvider.connection.publicConfigStore.on("update", account => {
      this.etheraccount = account;
      updateDefaultAccount(account.selectedAddress);
      this.$emit("login_ethereum", account);
    });

    // set aergo account event change listener
    window.addEventListener("AERGO_ACTIVE_ACCOUNT", event => {
      if(event.detail.error) {
        console.log(event.detail.error)
        return;
      }
      this.aergoaccount = event.detail.account;
      this.$emit("login_aergo", event.detail.account);
    });
  },
  methods: {
    getAergoActiveAccount() {
      window.postMessage({
        type: "AERGO_REQUEST",
        action: "ACTIVE_ACCOUNT"
      });
    },
    connectMetamask() {
      window.ethereum.enable();
    },
    aergoWalletColor() {
      return "purple";
    }
  }
};
</script>

<style scoped>
.blinking {
  animation: blink 1.5s ease-in-out infinite alternate;
}

@keyframes blink {
  0% {
    opacity: 0.2;
  }
  100% {
    opacity: 1;
  }
}
</style>