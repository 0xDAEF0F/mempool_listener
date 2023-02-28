import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { BalancerSDK, BalancerSdkConfig, Network } from "@balancer-labs/sdk";

dotenv.config();

const config: BalancerSdkConfig = {
  network: Network.MAINNET,
  rpcUrl: process.env.LOCAL_RPC_URL as string,
};

export async function writeTopPools() {
  const balancer = new BalancerSDK(config);
  const pools = await balancer.pools.all();

  pools.sort((a, b) => {
    if (+a.totalLiquidity > +b.totalLiquidity) return -1;
    return 1;
  });

  await fs.writeFile(
    path.resolve(__dirname, "top-pools.json"),
    JSON.stringify(
      pools.slice(0, 11).map((pool) => ({
        poolId: pool.id,
        totalLiquidity: pool.totalLiquidity,
        poolName: pool.name,
        token0: {
          address: pool.tokens[0].address,
          symbol: pool.tokens[0].symbol,
          decimals: pool.tokens[0].decimals,
        },
        token1: {
          address: pool.tokens[1].address,
          symbol: pool.tokens[1].symbol,
          decimals: pool.tokens[1].decimals,
        },
      }))
    ),
    (err) => {
      if (err) {
        console.log(err);
      }
    }
  );
}
