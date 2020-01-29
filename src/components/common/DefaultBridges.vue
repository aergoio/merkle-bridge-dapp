<script>
import { aergoBridgeAbi } from "../abi/AergoBridge";
import { etherBridgeAbi } from "../abi/EtherBridge";
import { erc20Abi } from "../abi/EtherERC20";
import { Validator } from "jsonschema";

export const assetType = {
  native: "native",
  erc20: "erc20",
  arc1: "arc1"
};

export const defaultBridges = [
  /*{
    bridge1: {
      net: {
        label: "Ethereum Local",
        type: "ethereum",
        networkVersion: "52306",
        endpoint: "http://127.0.0.1:8545",
        scan: ""
      },
      contract: {
        id: "0x89eD1D1C145F6bF3A7e62d2B8eB0e1Bf15Cb2374",
        abi: etherBridgeAbi
      },
      asset: {
        label: "ERC20 Aergo",
        type: assetType.erc20,
        isPegged: false,
        id: "0xd898383A12CDE0eDF7642F7dD4D7006FdE5c433e",
        abi: erc20Abi,
        decimals: 18
      }
    },
    bridge2: {
      net: {
        label: "Aergo Local",
        type: "aergo",
        chainId: "mainnet",
        endpoint: "http://127.0.0.1:7845",
        scan: ""
      },
      contract: {
        id: "AmgQqVWX3JADRBEVkVCM4CyWdoeXuumeYGGJJxEeoAukRC26hxmw",
        abi: aergoBridgeAbi
      },
      asset: {
        label: "Native Aergo",
        type: assetType.native,
        isPegged: false,
        id: "",
        decimals: 18
      }
    }
  }, */
  {
    bridge1: {
      net: {
        label: "Aergo Testnet",
        type: "aergo",
        chainId: "testnet.aergo.io",
        endpoint: "https://testnet-api-http.aergo.io",
        scan: "https://testnet.aergoscan.io/go?q="
      },
      contract: {
        id: "Amh76FdT5Q8rmeJxVb31GQubZ4nWQK4HzgbvE1u9jehQTXPg8Ksv",
        abi: aergoBridgeAbi 
      },
      asset: {
        label: "Native Aergo",
        type: assetType.native,
        isPegged: false,
        id: "",
        decimals: 18
      }
    },
    bridge2: {
      net: {
        label: "Ethereum Testnet",
        type: "ethereum",
        networkVersion: "3",
        endpoint: "https://ethtestnet.aergo.io/",
        scan: "https://ropsten.etherscan.io/search?q="
      },
      contract: {
        id: "0xd6d81a49527ec42Ed5E5a60B86F316E683991116",
        abi: etherBridgeAbi
      },
      asset: {
        label: "erc20 aergo",
        type: assetType.erc20,
        isPegged: false,
        id: "0x9b132615129867f747C26e58FEcdea8eF2b55Bb2",
        abi: erc20Abi,
        decimals: 18
      }
    }
  }
];

const netTemplate = {
  id: "/Net",
  type: "object",
  properties: {
    label: { type: "string" },
    type: { type: "string" },
    endpoint: { type: "string" },
    scan: { type: "string" },
    networkVersion: { type: "string" }, //(optional) ethereum
    chainId: { type: "string" } //(optional) aergo
  },
  required: ["label", "type", "endpoint", "scan"]
};

const contractTemplate = {
  id: "/Contract",
  type: "object",
  properties: {
    id: { type: "string" },
    abi: { type: ["array", "object"], items: { type: "object" } }
  },
  required: ["id", "abi"]
};

const assetTemplate = {
  id: "/Asset",
  type: "object",
  properties: {
    label: { type: "string" },
    type: { type: "string" },
    isPegged: { type: "boolean" },
    id: { type: "string" },
    abi: { type: ["array", "object"], items: { type: "object" } }, //(optional) only for ethereum
    decimals: { type: "integer", minimum: 1 }
  },
  required: ["label", "type", "isPegged", "id", "decimals"]
};

const bridgeTemplate = {
  id: "/Bridge",
  type: "object",
  properties: {
    net: { $ref: "/Net" },
    contract: { $ref: "/Contract" },
    asset: { $ref: "/Asset" }
  },
  required: ["net", "contract", "asset"]
};

const template = {
  id: "/Main",
  type: "object",
  properties: {
    bridge1: { $ref: "/Bridge" },
    bridge2: { $ref: "/Bridge" }
  },
  required: ["bridge1", "bridge2"]
};

var v = new Validator();
v.addSchema(netTemplate, "/Net");
v.addSchema(contractTemplate, "/Contract");
v.addSchema(assetTemplate, "/Asset");
v.addSchema(bridgeTemplate, "/Bridge");

export function validateBridge(newBridge) {
  let result = v.validate(newBridge, template);
  
  return {
    valid: result.valid,
    errors: result.errors
      .map(function(elem) {
        return elem.stack;
      })
      .join(", ")
  };
}

export default {};
</script>