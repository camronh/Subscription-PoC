require("dotenv").config();

const WooCommerceRestApi = require("@woocommerce/woocommerce-rest-api").default;
const childProcess = require("child_process"); // to execute shell commands

const { consumerKey, consumerSecret, providerURL, mnemonic } = process.env;

const sleepSeconds = 10;

const WooCommerce = new WooCommerceRestApi({
  url: "http://13.233.252.69",
  consumerKey,
  consumerSecret,
  version: "wc/v3",
});

async function whitelist(ethAddress) {
  console.log(`Whitelisting: ${ethAddress}`);
  return new Promise((resolve, reject) => {
    childProcess.exec(
      `docker run api3/airnode-admin:0.3.1 set-whitelist-expiration --mnemonic "${mnemonic}" --provider-url "${providerURL}" --endpoint-id 0xb46d3c17506312cf4b8c8a6248ba4610617e9628a9fd93389805db7986c96c29 --requester-address "${ethAddress}" --expiration-timestamp 1947451793 --airnode-address 0xCAc663035857b707aDF58674fA276C2aA74765BA`,
      function (err) {
        if (err) return reject(err);
        // console.log(stdout);
        console.log("Whitelisted!");
        resolve();
      }
    );
  });
}

async function markComplete(orderId) {
  if (!orderId) throw "No order ID";
  const response = await WooCommerce.put(`orders/${orderId}`, {
    status: "completed",
  });
  if (response.status !== 200)
    throw `Failed to mark order ${orderId} completed`;

  console.log(`Marked order ${orderId} completed`);
}

async function main() {
  const { data: orders } = await WooCommerce.get("orders", {
    status: "processing,on-hold",
  });
  if (orders.length) console.log(`Found ${orders.length} orders`);
  for (let order of orders) {
    try {
      await whitelist(order.billing.ethaddress);
      await markComplete(order.id);
    } catch (error) {
      console.log(error);
    }
  }
  // console.log(`Done, sleeping for ${sleepSeconds} seconds...`);
  await new Promise((resolve) => setTimeout(resolve, sleepSeconds * 1000));
  main();
}

console.log("Listening for new orders...\n\n");
main();
