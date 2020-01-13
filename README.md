# merkle-bridge-dapp

Merkle Bridge is a method to verify asset status securely using Merkle proof between two different blockchain networks. Merkle Bridge DApp makes it easy to move assets between Merkle Bridges via the Web UI.

## Pre-requisite

To service this, you'll first need an implementation of Merkle Bridge. See the following link to perform Merkle verification between the two networks.

* Between Aergo to Ethereum: https://github.com/aergoio/eth-merkle-bridge
* Between Aergo to Aergo: https://github.com/aergoio/merkle-bridge

Currently, the Aergo Foundation operates the Merkle proof service between Ethereum ropsten and Aergo Testnet.

## Project setup

### Dependent library installation

``` bash
yarn install
```

### Compiles and hot-reloads for development

``` bash
yarn run serve
```

### Compiles and minifies for production

``` bash
yarn run build
```

Build artifacts are generated in the `docs` folder.

## How to Use DApp

Here is an overview of how the app can be used to move assets between Aergo ERC20 tokens (Ethereum Network) and Native Aergo. (Aergo Network)

### Native Aergo to ERC20 Aergo

This section describes how to convert native Aergo into ERC20 token Aergo.

#### Select a bridge (Native Aergo on Testnet -> ERC20 Aergo on Ropsten)

Select the network and asset pair you want to transfer. Basically, a pair Aergo Native (Aergo Testnet) to Aergo ERC20 (Ethereum Ropsten Testnet) is supported. If you click it, it brings up a card that selects the direction and stage of movement of the asset. Choose a `Freeze Native Aergo` button.

#### Send an asset (Freeze Native Aergo)

First of all, on aergo testnet, Aergo must be sent to the Merkle Bridge contract to freeze. (After the frozen information is verified in the opposite network, it can be withdrawn from the opposite network)

If you don't have Aergo Connect Wallet installed first (https://chrome.google.com/webstore/detail/aergo-connect/iopigoikekfcpcapjlkcdlokheickhpc) And create account on testnet

If you don't have any Aergo, you can get it by requesting it from aergo testnet faucet. (https://faucet.aergoscan.io/)

1. Login to Aergo Wallet: Click on the Aergo icon in the upper right corner, then click the Login button
1. Confirm account access in Aergo Connect Wallet
1. Enter the Ethereum address to receive the ERC20 Aergo
1. Enter the amount of Aergo to transfer
1. Click `Send Freeze Tx` button
1. Confirm the transaction in Aergo Wallet

#### Wating a verification on Ropsten

Once you have successfully frozen Aergo, DApp will automatically proceed to the next step. You must wait for the freeze information to be verified from Ethereum Network.

1. Enter the Ethereum address you entered and click `Search` button
1. If the amount remains in the `under verification`, wait for the `next verification` time
1. Make sure that the all amount of transfer is written in the `verified` card
1. Click `Continue` button

This step does not need to be performed immediately after the previous step. This may be entered later through `Wait Verification` in `Select a Bridge` Step.

#### Receive the asset (Unlock ERC20 Aergo)

Withdraw the ERC20 Aergo deposited in the Merkle Bridge DApp on the Ethereum network.

1. Log in to the metamask. It does not have to be the same account as the address
1. Check the preset information set and click a `Send Unlock Tx` button
1. Confirm the transaction in Metamask Wallet

### ERC20 Aergo to Native Aergo

This section describes how to convert ERC20 token Aergo into native Aergo.

#### Select a bridge (ERC20 Aergo on Ropsten -> Native Aergo on Testnet)

Choose the pair Aergo Native (Aergo Testnet) to Aergo ERC20 (Ethereum Ropsten Testnet) and Click a `Lock ERC20 Aergo` button.

#### Send an asset (Lock ERC20 Aergo)

On ethereum testnet, ERC20 Aergo must be sent to the Merkle Bridge contract to Lock.

1. Log in to the metamask. The login account must have an ERC20 Aergo to transfer.
1. If you're new to this DApp, you need to click the Metamask button in the top right corner and click the `Connect DApp` button. And allow account access on the metamask.
1. Enter the Aergo address to receive the ERC20 Aergo
1. Enter the amount of ERC20 Aergo to transfer
1. The Merkle Bridge DApp needs to be approved by the user in order to send ERC20 instead. Press the increase approval button. Then click the `Send approve tx` button in the dialog poped up. Finally, approve the transaction in metamask (To check the updated amount, click the refresh button on the right)
1. Click a `Send Lock Tx` button
1. Confirm the transaction in Metamask

#### Wating a verification on Aergo Testnet

Wait for verification to complete on the Aergo network just as you would send a native Aergo to ERC20 Aergo.

1. Enter the Aergo address you entered and click `Search` button
1. Click `Continue` button

#### Receive the asset (Unfreeze Native Aergo)

Withdraw the Native Aergo deposited in the Merkle Bridge DApp on the Aergo network.

1. Click the Aergo icon in the upper right corner and press the `login` button.
1. Click on the account you would like to use in your Aergo Connect wallet and authorize it. (The login account does not need to be same as an account to receive. However, since you need to create a transaction to unfreeze, the account need to have some Aergo)
1. Check the preset information set and click a `Send Unfreeze Tx` button
1. Confirm the transaction in Aergo Connect Wallet