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
      window.addEventListener(
        "AERGO_SEND_TX_RESULT",
        event => {
          setTimeout(async () => {
            try {
              if (event.detail.error) {
                reject(event.detail.error);
              } else {
                let receipt = await herajs.getTransactionReceipt(
                  event.detail.hash
                );
                // set to new key to match with ether
                receipt.blockNumber = receipt.blockno;
                receipt.blockHash = receipt.blockhash;
                receipt.transactionHash = event.detail.hash;
                resolve(receipt);
              }
            } catch (err) {
              reject(err);
            }
          }, 2000);
        },
        {
          once: true
        }
      );

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

export async function getAergoNextVerifyToReceiver(
  web3Full,
  herajs,
  bridgeAergoAddr,
  bridgeEthAddr,
  eventName,
  receiverAddress
) {
  let anchorStatusQuery = await utils.getAergoAnchorStatus(
    web3Full,
    herajs,
    bridgeEthAddr
  );

  const fromBlock =
    anchorStatusQuery.bestHeight -
    (anchorStatusQuery.tAnchor + anchorStatusQuery.tFinal);

  let args = new Map();
  args.set(1, receiverAddress.slice(2).toLowerCase());

  let events = await herajs.getEvents({
    address: bridgeAergoAddr,
    eventName: eventName,
    blockfrom: fromBlock,
    args: args
  });
  let nextAnchorHeight =
    anchorStatusQuery.lastAnchorHeight +
    anchorStatusQuery.tAnchor +
    anchorStatusQuery.tFinal -
    anchorStatusQuery.bestHeight;

  /* eslint-disable */
  console.log("update status - event", nextAnchorHeight, anchorStatusQuery);

  if (nextAnchorHeight < 0) {
    nextAnchorHeight = "Verifying";
  }

  if (events.length === 0) {
    // event is not exist between fromBlock to bestHeight.
    // it represents that anchoring is delayed

    return ["Delayed", nextAnchorHeight];
  } else {
    for (let n = 1; n < 10000; n++) {
      // for each future anchors
      let nthAnchorHeight =
        n * anchorStatusQuery.tAnchor + anchorStatusQuery.lastAnchorHeight;

      // try to find first anchor which's height is bigger than event + finalized block no
      if (nthAnchorHeight > events[0].blockno) {
        let remainAnchorHeight =
          nthAnchorHeight +
          anchorStatusQuery.tFinal -
          anchorStatusQuery.bestHeight;
        console.log("find event", events, remainAnchorHeight);

        if (remainAnchorHeight > 0) {
          return [remainAnchorHeight, nextAnchorHeight];
        } else {
          return ["Verifying", nextAnchorHeight];
        }
      }
    }

    return ["Too big anchor height", nextAnchorHeight];
  }
}

export async function getEthNextVerifyToReceiver(
  web3Full,
  herajs,
  bridgeEthAddr,
  bridgeEthAbi,
  bridgeAergoAddr,
  eventName,
  receiverAddress
) {
  let anchorStatusQuery = await utils.getEthAnchorStatus(
    web3Full,
    herajs,
    bridgeAergoAddr
  );

  const fromBlock =
    anchorStatusQuery.bestHeight -
    (anchorStatusQuery.tAnchor + anchorStatusQuery.tFinal);

  const contract = new web3Full.eth.Contract(bridgeEthAbi, bridgeEthAddr);

  let events = await contract.getPastEvents("anchorEvent", {
    topics: [, , web3Full.utils.sha3(receiverAddress)],
    fromBlock: fromBlock,
    toBlock: "latest"
  });
  let nextAnchorHeight =
    anchorStatusQuery.lastAnchorHeight +
    anchorStatusQuery.tAnchor +
    anchorStatusQuery.tFinal -
    anchorStatusQuery.bestHeight;

  console.log("update status - event", nextAnchorHeight, anchorStatusQuery);

  if (nextAnchorHeight < 0) {
    nextAnchorHeight = "Verifying";
  }

  if (events.length === 0) {
    // event is not exist between fromBlock to bestHeight.
    // It represent that anchoring is delayed

    return ["Delayed", nextAnchorHeight];
  } else {
    for (let n = 1; n < 10000; n++) {
      let nthAnchorHeight =
        n * anchorStatusQuery.tAnchor + anchorStatusQuery.lastAnchorHeight;

      // try to find first anchor which's height is bigger than event + finalized block no
      if (nthAnchorHeight > events[events.length - 1].blockNumber) {
        let remainAnchorHeight =
          nthAnchorHeight +
          anchorStatusQuery.tFinal -
          anchorStatusQuery.bestHeight;

        console.log("find event", events, remainAnchorHeight);

        if (remainAnchorHeight > 0) {
          return [remainAnchorHeight, nextAnchorHeight];
        } else {
          return ["Verifying", nextAnchorHeight];
        }
      }
    }

    return ["Too big anchor height", nextAnchorHeight];
  }
}

export default {};
</script>