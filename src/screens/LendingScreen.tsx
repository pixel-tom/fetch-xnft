import { Text, View, FlatList, StyleSheet, Dimensions } from "react-native";
import tw from "twrnc";
import { useState, useEffect } from "react";
import fetchLendingAccounts from "../utils/fetchLendingAccounts";

import { Screen } from "../components/Screen";
import { LendingData } from "../types/types";

import { Image } from "react-native";

export function LendingScreen() {
  const address = "AYSTZJKba5bFXkdoKAUJbpnU38cSz8PT5AVifJL8ACWP";
  const [openLendingData, setOpenLendingData] = useState<LendingData[]>([]);

  const styles = StyleSheet.create({
    cardContainer: {
      width: Dimensions.get("window").width / 2 - 24,
      margin: "auto",
      padding: 8,
      borderWidth: 1,
      borderRadius: 4,
      borderColor: "#222222",
      backgroundColor: "#0F0F0F",
    },
  });

  useEffect(() => {
    const fetchData = async () => {
      const data = await fetchLendingAccounts(address);
      setOpenLendingData(data);
    };
    fetchData();
  }, []);

  const renderOpenItem = ({ item }: { item: LendingData }) => {
    const loanDurationDays = Math.round(item.loanDurationSeconds / 86400);
    const principalAmountSol = item.principalAmount / 10 ** 9; // convert to Sol
    const amountToRepaySol = item.amountToRepay / 10 ** 9; // convert to Sol
    const revenueSol = (amountToRepaySol - principalAmountSol).toFixed(3); // calculate revenue and round to 3 decimal places

    return (
      <View
        style={[
          tw`mb-2 p-0 w-full bg-gray-800 border border-gray-700 rounded-lg`,
          styles.cardContainer,
        ]}
      >
        <View style={tw`w-full mb-2`}>
          <Image
            source={{
              uri: `https://cdn.hellomoon.io/nft/${item.collateralMint}?apiKey=151c15b0-d21d-40b2-9786-49678176b715&format=webp&width=500&height=500`,
            }}
            style={{ width: "100%", aspectRatio: 1, borderRadius: 4 }}
          />
        </View>
        <View style={tw`mb-2 ml-2`}>
          <Text style={tw`text-xs font-bold text-white`}>Loan Amount</Text>
          <Text style={tw`text-xs text-gray-300`}>
            {principalAmountSol} SOL
          </Text>
        </View>
        <View style={tw`mb-2 ml-2`}>
          <Text style={tw`text-xs font-bold text-white`}>APY</Text>
          <Text style={tw`text-xs text-gray-300`}>{item.apy} %</Text>
        </View>
        <View style={tw`mb-2 ml-2`}>
          <Text style={tw`text-xs font-bold text-white`}>Duration</Text>
          <Text style={tw`text-xs text-gray-300`}>{loanDurationDays} Days</Text>
        </View>
        <View style={tw`mb-2 ml-2`}>
          <Text style={tw`text-xs font-bold text-white`}>Interest Due</Text>
          <Text style={tw`text-xs text-green-400`}>+ {revenueSol} SOL</Text>
        </View>
        {item.market === "Sharky" ? (
          <View style={tw`absolute top-0 right-0 p-1`}>
            <Image
              source={{ uri: "https://sharky.fi/sharky.svg" }}
              style={{ width: 24, height: 24 }}
            />
          </View>
        ) : (
          <View style={tw`absolute top-0 right-0 p-1`}>
            <Text style={tw`text-xs font-bold text-green-500`}>OPEN</Text>
          </View>
        )}
      </View>
    );
  };

  return (
    <Screen style={tw`bg-black`}>
      {openLendingData.length > 0 ? (
        <>
          <Text style={tw`mb-2 font-bold text-white`}>Open Loans:</Text>
          <FlatList
            data={openLendingData}
            keyExtractor={(item) => item.transactionId}
            numColumns={2} // specify the number of columns
            renderItem={renderOpenItem}
          />
        </>
      ) : (
        <Text>No open lending account data found.</Text>
      )}
    </Screen>
  );
}
