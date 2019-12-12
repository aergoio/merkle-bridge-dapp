<script>
import { Address } from "@herajs/client";
import { web3 } from "./Web3Loader";
import { utils } from "eth-merkle-bridge-js";
import { AergoClient, GrpcWebProvider, Amount } from "@herajs/client";

export function validateAddress(netType, address) {
  if (!address) {
    return "Address is required";
  } else if (netType == "aergo") {
    try {
      new Address(address);
      utils.checkAergoAddress(address);
      return true; // no error
    } catch (error) {
      return error.message;
    }
  } else if (netType == "ethereum") {
    try {
      web3.utils.toChecksumAddress(address);
      return true; // no error
    } catch (error) {
      return error.message;
    }
  }
  return "unknown network type " + netType;
}

export function loadReceivers() {
  const jsonItems = localStorage.getItem("savedReceivers");
  if (jsonItems) {
    return JSON.parse(jsonItems);
  }
  return [];
}

export function saveReceiver(receiver) {
  let parsedItems = [];
  const jsonItems = localStorage.getItem("savedReceivers");

  if (jsonItems) {
    parsedItems = JSON.parse(jsonItems);
  }
  //TODO prevent duplicate
  // push item to first
  parsedItems.unshift(receiver);

  // remove oldest history item
  if (parsedItems.length > 5) {
    parsedItems.pop();
  }

  localStorage.setItem("savedReceivers", JSON.stringify(parsedItems));
}

export function applyDecimals(amount, decimals, isPositive) {
  //convert other types to string
  if (amount instanceof Amount) {
    amount = amount.formatNumber();
  } else if (typeof amount === "number") {
    amount = amount.toString();
  }
  if (isPositive) {
    return Amount.moveDecimalPoint(amount, parseInt(decimals));
  } else {
    return Amount.moveDecimalPoint(amount, -1 * parseInt(decimals));
  }
}

export function sendTxToAergoConnect(endpoint, contractID, builtTx) {
  let herajs = new AergoClient({}, new GrpcWebProvider({ url: endpoint }));

  builtTx.to = contractID;
  builtTx.payload_json = JSON.parse(builtTx.payload);
  delete builtTx.payload;

  return new Promise((resolve, reject) => {
    try {
      // register event handler
      window.addEventListener("AERGO_SEND_TX_RESULT", (event) => {
        setTimeout(async () => {
          try {
            if (event.detail.error) {
              reject(event.detail.error);
            } else {
              const receipt = await herajs.getTransactionReceipt(
                event.detail.hash
              );
              resolve(receipt);
            }
          } catch (err) {
            reject(err);
          }
        }, 2000);
      }, {
        once: true
      });
      
      // send build tx request
      window.postMessage({
        type: "AERGO_REQUEST",
        action: "SEND_TX",
        data: builtTx
      });
    } catch (err) {
      reject(err);
    }
  });
}

export default {};
</script>