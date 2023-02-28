import dotenv from "dotenv";
import to from "await-to-js";
import fs from "fs";
import path from "path";
import { writeTopPools } from "./top-pools";
import { ethers } from "ethers";
import { BalancerSDK, BalancerSdkConfig, Network } from "@balancer-labs/sdk";

dotenv.config();

const BALANCER_VAULT = "0xBA12222222228d8Ba445958a75a0704d566BF2C8" as const;
const SWAP_SIGNATURE = "0x52bbbe29" as const;

const config: BalancerSdkConfig = {
  network: Network.MAINNET,
  rpcUrl: process.env.LOCAL_RPC_URL as string,
};

async function main() {
  const provider = new ethers.JsonRpcProvider(
    process.env.LOCAL_RPC_URL as string
  );
  const balancer = new BalancerSDK(config);

  await writeTopPools();

  provider.on("pending", async (txHash) => {
    const tx = await provider.getTransaction(txHash);
    if (tx == null) return;
    if (tx.to !== BALANCER_VAULT) return;
    if (tx.data.slice(0, 10) !== SWAP_SIGNATURE) return;
    const [err, ok] = await to(provider.call(tx));
    if (err) console.log("error: ", err);
    if (ok) console.log("ok: ", ok);
  });
}
main();
