import { Connection, PublicKey } from "@solana/web3.js";
import { getFullUserStats, getLoansFromBorrower } from "@rainfi/sdk/dist/utils/fetch.utils";
import { usePublicKey } from "react-xnft";

const connection = new Connection("https://rpc.helius.xyz/?api-key=e6b85a35-8829-4016-ac2f-90755018d1b6");

const addressToCheck = new PublicKey("8GSHYw7MvmA1gMPmHnSozARbq893XAwFxaKfy8KAcbyP");

export async function fetchUserStats(address: string) {
  try {
    const addressToCheck = new PublicKey(address);
    const loans = await getLoansFromBorrower(connection, addressToCheck);
    const ongoingLoans = loans.filter(loan => loan.status === 'ongoing');
    const loanObjects = ongoingLoans.map(loan => {
      return {
        accountAddress: loan.accountAddress,
        amount: loan.amount,
        borrower: loan.borrower,
        collection: loan.collection,
        createdAt: loan.createdAt,
        currency: loan.currency,
        duration: loan.duration,
        expiredAt: loan.expiredAt,
        interest: loan.interest,
        isCustom: loan.isCustom,
        isFrozen: loan.isFrozen,
        kind: loan.kind,
        lender: loan.lender,
        liquidatedAt: loan.liquidatedAt,
        liquidation: loan.liquidation,
        marketplace: loan.marketplace,
        mint: loan.mint,
        pool: loan.pool,
        price: loan.price,
        repaidAt: loan.repaidAt,
        sale: {
          isForSale: loan.sale.isForSale,
          salePrice: loan.sale.salePrice,
          currency: loan.sale.currency,
        },
        soldAt: loan.soldAt,
        status: loan.status,
      };
    });
    console.log(loanObjects);
    return loanObjects;
  } catch (error) {
    console.error(error);
    return null;
  }
}

export default fetchUserStats;

