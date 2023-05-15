import { Connection, Keypair, PublicKey } from "@solana/web3.js";
import { Rain } from "@rainfi/sdk";

const connection = new Connection("https://rpc.helius.xyz/?api-key=e6b85a35-8829-4016-ac2f-90755018d1b6");


const rain = new Rain(connection);

const { getFullUserStats } = rain.utils;

const addressToCheck = new PublicKey("EdbiTrbtU6Xn12W6cHWcAeMb5FUKiVxmEerUovmBfpbi");

export async function fetchUserStats() {
  const stats = await getFullUserStats(connection, addressToCheck, [
    "So11111111111111111111111111111111111111112", // Solana
    "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v", // USDC
  ]);
  console.log({ stats });
  return stats;
}


export { getFullUserStats };
