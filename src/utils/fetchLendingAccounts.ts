import axios from "axios";

const fetchLendingAccounts = async (address: string) => {
  const options = {
    method: "POST",
    url: "https://rest-api.hellomoon.io/v0/nft/loans",
    headers: {
      accept: "application/json",
      "content-type": "application/json",
      authorization: "Bearer 151c15b0-d21d-40b2-9786-49678176b715",
    },
    data: { lender: address, status: 'active', limit: 500 },
  };

  try {
    const response = await axios.request(options);
    const data = response.data.data;
    const openData = data.filter(
      (item: { status: string }) => item.status === "active" || item.status === "extended"
    );
    const closedLendingData = data.filter(
      (item: { status: string }) =>
        item.status === "repaid" ||
        item.status === "liquidated"
    );
    return openData;
    return closedLendingData;
  } catch (error) {
    console.error(error);
    return [];
  }
};

export default fetchLendingAccounts;
