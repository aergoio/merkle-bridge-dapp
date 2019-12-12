<template>
  <div>
    TODO is this OK??????
    <v-container fluid class="pa-0">
      <v-data-iterator
        :items="txs"
        :items-per-page.sync="itemsPerPage"
        :page="page"
        :search="search"
      >
        <template v-slot:header>
          <v-text-field
            v-model="search"
            clearable
            hide-details
            prepend-inner-icon="mdi-account"
            label="Filter by To Address"
          ></v-text-field>
          <br />
        </template>
        <template v-slot:default="props">
          <v-row v-for="item in props.items" :key="item.sendTxs[0].sendTxId" cols="12">
            <v-card width="100%" class="ma-1">
              <v-row align="center">
                <v-col cols="2">{{ item.amount }}</v-col>
                <v-col cols="8" align="left">
                  <div class="overline mb-2">From: {{ item.senderAddr }}</div>
                  To: {{ item.receiverAddr }}
                </v-col>
                <v-col cols="2">
                  <span v-if="item.status === 'completed'">
                    <v-icon left>mdi-check</v-icon>{{ item.status }}
                  </span>

                  <span v-if="item.status === 'verified'">
                      <v-icon left>mdi-cloud-check</v-icon>
                      {{ item.status }}
                  </span>
                  <span v-if="item.status === 'on verifying'">
                      <v-icon left>mdi-cloud-sync</v-icon>
                      {{ item.status }}
                  </span>
                </v-col>
              </v-row>

              <v-divider></v-divider>
              <v-row class="pl-7">
                <v-col class="pa-0" cols="12" align="left">
                  <span v-for="tx in item.sendTxs" :key="tx.sendTxId">

                  burn tx: {{tx.sendTxId}}
                  <small>({{ printDate(tx.sendTxTime) }})</small>
                  <br/>
                  </span>
                </v-col>
              </v-row>
              <v-row class="pl-7">
                <v-col class="pa-0" cols="12" align="left">
                  unlock tx: {{item.receiveTxId}}
                  <small>({{ printDate(item.receiveTxTime) }})</small>
                </v-col>
              </v-row>
              <v-divider></v-divider>
            </v-card>
          </v-row>
          <v-row>
            if reach last page load more... (Next 10000 blocks?)
            <v-btn text :loading="loading" :disabled="loading">
              <v-icon dark>mdi-chevron-down</v-icon>(TODO Load More...)
            </v-btn>
          </v-row>
        </template>
      </v-data-iterator>
    </v-container>
  </div>
</template>

<script>
export default {
  name: "History",
  components: {
    //
  },
  data: () => ({
    fromAddress: "",
    fromAddressRules: [],
    toAddress: "",
    toAddressRules: [],
    search: "",
    page: 1,
    itemsPerPage: 10,
    loading: false,
    txs: [
      {
        status: "on verifying",
        sendTxs: [
          {
            sendTxId:
              "0xe43f385fc218dfd192c95123f17d55100f4932735a615b78c7ad53c35a99bb1d",
            sendTxTime: 1570442933000
          },
          {
            sendTxId:
              "0xe33f385fc218dfd192c95123f17d55100f4932735a615b78c7ad53c35a99bb1d",
            sendTxTime: 1570442933020
          }
        ],
        receiveTxId:
          "",
        receiveTxTime: null,
        senderAddr: "0x7aa5e01be053e585a756586ee3fcd7b3f41fcd49",
        receiverAddr: "0x4fed1fc4144c223ae3c1553be203cdfcbd38c581",
        amount: "0.04895"
      },
      {
        status: "verified",
        sendTxs: [
          {
            sendTxId:
              "0xe43f385fc218dfd192c95123f17d55100f4932735a615b78c7ad53c35a99bb2d",
            sendTxTime: 1570438100000
          }
        ],
        receiveTxId: "",
        receiveTxTime: null,
        senderAddr: "0x7aa5e01be053e585a756586ee3fcd7b3f41fcd49",
        receiverAddr: "0x4fed1fc4144c223ae3c1553be203cdfcbd38c581",
        amount: "195.123"
      },
      {
        status: "completed",
        sendTxs: [{sendTxId:
          "0xe43f385fc218dfd192c95123f17d55100f4932735a615b78c7ad53c35a99bb1b",
        sendTxTime: 1570438000000}],
        receiveTxId: "0xe43f385fc218dfd192c95123f17d55100f4932735a615b78c7ad53c35a99bb1b",
        receiveTxTime: 1570438000000,
        senderAddr: "0x7aa5e01be053e585a756586ee3fcd7b3f41fcd49",
        receiverAddr: "0x4fed1fc4144c223ae3c1553be203cdfcbd38c581",
        amount: "0.123"
      }
    ]
  }),
  methods: {
    //
    printDate(time) {
      return new Date(time).toLocaleString();
    }
  }
};
</script>

<style>
</style>