<script>
import { aergoBridgeAbi } from "../abi/AergoBridge";
import { etherBridgeAbi } from "../abi/EtherBridge";
import { erc20Abi } from "../abi/EtherERC20";

export const assetType = {
  native: "native",
  erc20: "erc20",
  arc1: "arc1"
};

export const defaultBridges = [
  {
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
  },
 /* {
    bridge1: {
      net: {
        label: "Aergo testnet",
        type: "aergo",
        chainId: "testnet.aergo.io",
        endpoint: "http://127.0.0.1:3000",
        scan: "https://testnet.aergoscan.io/account/"
      },
      contract: {
        id: "AmfzMkaFchxxqg39mcSMkj1rnnBtUZUipDhLBi2H3ewDReJjzLGz",
        abi: aergoBridgeAbi
      },
      asset: {
        label: "native aergo",
        type: assetType.native,
        isPegged: false,
        id: ""
      }
    },
    bridge2: {
      net: {
        label: "Ethereum testnet",
        type: "ethereum",
        networkVersion: "3",
        endpoint: "127.0.0.2:3000",
        scan: "https://ropsten.etherscan.io/address/"
      },
      contract: {
        id: "0xef27c1d9b1464e0edbcc69b429b872eb89877bd9",
        abi: etherBridgeAbi
      },
      asset: {
        label: "erc20 aergo",
        type: assetType.erc20,
        isPegged: false,
        id: "0xd898383A12CDE0eDF7642F7dD4D7006FdE5c433e",
        abi: erc20Abi
      }
    }
  },
  {
    bridge1: {
      net: {
        label: "Aergo testnet",
        type: "aergo",
        chainId: "testnet.aergo.io",
        endpoint: "http://127.0.0.1:3000",
        scan: "https://testnet.aergoscan.io/account/"
      },
      contract: { id: "AmfzMkaFchxxqg39mcSMkj1rnnBtUZUipDhLBi2H3ewDReJjzLGz" },
      asset: {
        label: "arc1 gotchu",
        type: assetType.arc1,
        isPegged: true,
        id: "0xef27c1d9b1464e0edbcc69b429b872eb89877bd9"
      }
    },
    bridge2: {
      net: {
        label: "Ethereum testnet",
        type: "ethereum",
        networkVersion: "3",
        endpoint: "127.0.0.2:3000",
        scan: "https://ropsten.etherscan.io/address/"
      },
      contract: { id: "0xef27c1d9b1464e0edbcc69b429b872eb89877bd9" },
      asset: {
        label: "erc20 gotchu",
        type: assetType.erc20,
        isPegged: false,
        id: "0xef27c1d9b1464e0edbcc69b429b872eb89877bd9"
      }
    }
  }*/
];

export default {};
</script>