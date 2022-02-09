# Airnode Authorizers PoC

> A Proof-of-Concept that demonstrates how a Web3 user could pay an API provider for access to their Airnode using on-chain [Authorizers](https://docs.api3.org/airnode/v0.3/concepts/authorization.html#authorizers)

## Under the Hood

Secrets used on a public blockchain become public. It is important that we avoid sending API secrets over the blockchain while still allowing API providers granular control over user access. This can be achieved through whitelisting an address, similar to IP Address whitelisting, but for wallet/contract addresses.

API providers have the options of off-chain or on-chain whitelisting. On-chain whitelisting is achieved through Airnode's [Authorizers](https://docs.api3.org/airnode/v0.3/concepts/authorization.html#authorizers). When your Airnode finds a new request to process, if Authorizers are enabled, it checks a [Contract](https://docs.api3.org/airnode/v0.3/concepts/authorization.html#requesterauthorizerwithairnode) for authorization status before making the request to the API. Only the [mnemonic used in Airnode deployment](/airnode/config/secrets.env) will have permissions to update your whitelist, and you will have to pay for the gas used in the whitelisting transaction.

![Authorizers Flow](https://user-images.githubusercontent.com/26840412/153293097-d53066e5-9292-4f79-bcbf-93c36e33e8ea.png)

> More detailed [Diagram Here](https://docs.api3.org/airnode/v0.3/concepts/authorization.html#authorizers)

In this PoC, we take the role of a random number generation API provider that requires (sandbox) credit card payment through our [Webstore](http://13.233.252.69/). Our API subscription order form includes an `Eth_Address` field. Our [Fulfillment Script](/whitelister) whitelists that address using the [API3 RequesterAuthorizerWithAirnode Authorizer Contract](https://docs.api3.org/airnode/v0.3/concepts/authorization.html#requesterauthorizerwithairnode).

## Repo Structure

- [Airnode](/airnode) - Everything you need to run a First-Party Oracle.
- [Front End](/frontend) - GUI for [Smart Contract](/hardhat) that requests random numbers
- [Fulfillment Script](/api) - The Snowflake proxy API that handles authentication.
- [Webstore](http://13.233.252.69/) - An example Wordpress Woocommerce PoS for API Subscriptions

  ***

# Instructions

These steps should be followed to demonstrate the flow of being denied access, then being granted access and having your request responded to.

> Using our Gitpod will automate your environment setup in a few minutes in the cloud to reduce the resources you'll need. We **highly** recommend using Gitpod if possible. Skip to step 5 if you are using Gitpod.

[![Open in Gitpod](https://gitpod.io/button/open-in-gitpod.svg)](https://gitpod.io/#https://github.com/camronh/Subscription-PoC)

If you are attempting to run the code manually/locally. First clone this repo. Then, start from the root directory of the repo:

### 1. Start up your Airnode

```sh
yarn start-airnode
```

### 2. In another terminal [Start up your Front End GUI](/frontend)

```sh
# Navigate to front end directory
cd frontend

yarn start
```

### 3. In another terminal, start your [fulfillment script](/whitelister)

```sh
# Navigate to front end directory
cd whitelister

yarn start
```

### 4. In another terminal, prep your [smart contracts](/frontend)

```sh
# Navigate to hardhat directory
cd hardhat

yarn prep
```

### 5. In the Hardhat terminal, deploy a fresh and unauthorized contract

```sh
yarn deploy-requester

# Note the address of the deployed contract as it will be used later
```

### 6. Attempt an API request using the GUI.

> Make sure your metamask is connected and you are on Rinkeby. You will need some rinkeby to make the original transaction of putting the request on chain.

![Attempt Request](https://user-images.githubusercontent.com/26840412/153304922-1af53024-a5e5-4083-bc1a-62c8569108de.png)

This request will fail and the request will hang in the in the GUI indefinitely. This is expected because we haven't been authorized. You can check the terminal from Step 2 for logs that should contain the `Unauthorized` message.

### 7. Pay for the API provider subscription

Go to our [API Provider Mock Webstore](http://13.233.252.69/product/api-subscription/) and order a 14 Day subscription.

At checkout, be sure to input the contract address from Step 5

![Insert contract address](https://user-images.githubusercontent.com/26840412/153293704-547d9101-f6b6-4ffe-be3f-c94f691e5c74.png)

You can observe the whitelisting process if you switch to the Fulfillment Script terminal from Step 3.

### 8. You're whitelisted! Try another request

In the GUI, refresh the page, then request a random number again. You can keep an eye on the Airnode terminal from Step 1 to watch your request being fulfilled.

**_ IMAGe of Response and terminal open in gitpod _**
