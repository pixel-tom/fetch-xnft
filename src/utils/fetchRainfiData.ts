import { Connection, PublicKey } from "@solana/web3.js";
import { getFullUserStats, getLoansFromBorrower } from "@rainfi/sdk/dist/utils/fetch.utils";
import { usePublicKey } from "react-xnft";

const connection = new Connection("https://rpc.helius.xyz/?api-key=e6b85a35-8829-4016-ac2f-90755018d1b6");


const addressToCheck = new PublicKey("9s96jF3D2uXaCjmphDXDmwXna2rxGDS3Wi8vARaQbErS");

export async function fetchUserStats() {
  try {
    const loans = await getLoansFromBorrower(connection, addressToCheck);
    if (loans.length > 0) {
      const firstLoan = loans[0];
      return firstLoan;
    } else {
      return null;
    }
  } catch (error) {
    console.error(error);
    return null;
  }
}


export default getFullUserStats;
