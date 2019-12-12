<script>
export const aergoBridgeAbi = {
  version: "0.2",
  language: "lua",
  functions: [
    {
      name: "freeze",
      payable: true,
      arguments: [{ name: "receiver" }, { name: "amount" }]
    },
    {
      name: "constructor",
      arguments: [
        { name: "aergoErc20" },
        { name: "validators" },
        { name: "tAnchor" },
        { name: "tFinal" }
      ]
    },
    { name: "default", payable: true, arguments: [] },
    {
      name: "validatorsUpdate",
      arguments: [
        { name: "validators" },
        { name: "signers" },
        { name: "signatures" }
      ]
    },
    {
      name: "unfreeze",
      arguments: [
        { name: "receiver" },
        { name: "balance" },
        { name: "merkleProof" }
      ]
    },
    {
      name: "unlock",
      arguments: [
        { name: "receiver" },
        { name: "balance" },
        { name: "tokenAddress" },
        { name: "merkleProof" }
      ]
    },
    {
      name: "burn",
      arguments: [
        { name: "receiver" },
        { name: "amount" },
        { name: "mintAddress" }
      ]
    },
    {
      name: "tokensReceived",
      arguments: [
        { name: "operator" },
        { name: "from" },
        { name: "value" },
        { name: "receiver" }
      ]
    },
    {
      name: "mint",
      arguments: [
        { name: "receiver" },
        { name: "balance" },
        { name: "tokenOrigin" },
        { name: "merkleProof" }
      ]
    },
    {
      name: "unfreezeFeeUpdate",
      arguments: [{ name: "fee" }, { name: "signers" }, { name: "signatures" }]
    },
    {
      name: "newAnchor",
      arguments: [
        { name: "root" },
        { name: "height" },
        { name: "signers" },
        { name: "signatures" }
      ]
    },
    {
      name: "tAnchorUpdate",
      arguments: [
        { name: "tAnchor" },
        { name: "signers" },
        { name: "signatures" }
      ]
    },
    {
      name: "tFinalUpdate",
      arguments: [
        { name: "tFinal" },
        { name: "signers" },
        { name: "signatures" }
      ]
    }
  ],
  state_variables: [
    { name: "_unfreezes", type: "map" },
    { name: "_mintedTokens", type: "map" },
    { name: "_validators", type: "map" },
    { name: "_locks", type: "map" },
    { name: "_mints", type: "map" },
    { name: "_bridgeTokens", type: "map" },
    { name: "_aergoErc20Bytes", type: "value" },
    { name: "_tAnchor", type: "value" },
    { name: "_unfreezeFee", type: "value" },
    { name: "_burns", type: "map" },
    { name: "_validatorsCount", type: "value" },
    { name: "_contractId", type: "value" },
    { name: "_anchorRoot", type: "value" },
    { name: "_anchorHeight", type: "value" },
    { name: "_tFinal", type: "value" },
    { name: "_nonce", type: "value" },
    { name: "_unlocks", type: "map" }
  ]
};

export default {}
</script>