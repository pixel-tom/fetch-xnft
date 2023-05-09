import {
  Text,
  View,
  FlatList,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
} from "react-native";
import tw from "twrnc";
import { useState, useEffect } from "react";
import fetchBorrowingAccounts from "../utils/fetchBorrowingAccounts";
import { Screen } from "../components/Screen";
import { BorrowingData } from "../types/types";
import { Image } from "react-native";
import { usePublicKeys } from "../hooks/xnft-hooks";

export function BorrowingScreen() {
  const publicKey = usePublicKeys();
  const address = "HLFM7GmwN4NXvK2SuhmLFiADHq8UdK6i4uNxgkRD5aT5";
  const [openBorrowingData, setOpenBorrowingData] = useState<BorrowingData[]>(
    []
  );
  const [displayedItems, setDisplayedItems] = useState<BorrowingData[]>([]);

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
    const fetchBorrowingData = async () => {
      const data = await fetchBorrowingAccounts(address);
      setOpenBorrowingData(data);
      setDisplayedItems(data.slice(0, 10));
    };
    fetchBorrowingData();
  }, []);

  const showMoreItems = () => {
    const currentLength = displayedItems.length;
    const newItems = openBorrowingData.slice(currentLength, currentLength + 10);
    setDisplayedItems([...displayedItems, ...newItems]);
  };

  const renderOpenBorrowingItem = ({ item }: { item: BorrowingData }) => {
    const loanDurationDays = Math.round(item.loanDurationSeconds / 86400);
    const principalAmountSol = item.principalAmount / 10 ** 9; // convert to Sol
    const amountToRepaySol = item.amountToRepay / 10 ** 9; // convert to Sol
    const now = Date.now() / 1000; // get the current time in seconds
    const endTime = (item.acceptBlocktime || now) + item.loanDurationSeconds; // calculate the end time in seconds
    const timeRemaining = endTime - now; // calculate the remaining time in seconds
    const daysRemaining = Math.floor(timeRemaining / 86400); // convert seconds to days
    const hoursRemaining = Math.floor((timeRemaining % 86400) / 3600); // convert the remaining seconds to hours
    const minutesRemaining = Math.floor((timeRemaining % 3600) / 60); // convert the remaining seconds to minutes

    let apy = item.apy;
    let interestDueSol = (amountToRepaySol - principalAmountSol).toFixed(3); // calculate interest and round to 3 decimal places

    if (item.market === "Frakt" && apy === null) {
      const interest = amountToRepaySol - principalAmountSol;
      apy =
        ((1 + interest / principalAmountSol) ** (365 / loanDurationDays) - 1) *
        100;
      interestDueSol = "0.00";
    }

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
          <Text style={tw`text-xs text-gray-300`}>
            {apy ? apy.toFixed(2) : "N/A"} %
          </Text>
        </View>
        <View style={tw`mb-2 ml-2`}>
          <Text style={tw`text-xs font-bold text-white`}>Duration</Text>
          <Text style={tw`text-xs text-gray-300`}>{loanDurationDays} Days</Text>
        </View>
        <View style={tw`mb-2 ml-2`}>
          <Text style={tw`text-xs font-bold text-white`}>Interest Due</Text>
          <Text style={tw`text-xs text-red-400`}>- {interestDueSol} SOL</Text>
        </View>
        <View style={tw`mb-2 ml-2`}>
          <Text style={tw`text-xs font-bold text-white`}>Ends</Text>
          <Text style={tw`text-sm text-gray-400`}>
            {daysRemaining} Days {hoursRemaining} Hours {minutesRemaining}{" "}
            Minutes
          </Text>
        </View>

        {item.market === "Sharky" ? (
          <View style={tw`absolute top-0 right-0 p-1`}>
            <Image
              source={{ uri: "https://sharky.fi/sharky.svg" }}
              style={{ width: 24, height: 24 }}
            />
          </View>
        ) : item.market === "Frakt" ? (
          <View style={tw`absolute top-0 right-0 p-1`}>
            <Image
              source={{
                uri: "https://www.gitbook.com/cdn-cgi/image/width=256,dpr=2,height=30,fit=contain,format=auto/https%3A%2F%2F500644324-files.gitbook.io%2F~%2Ffiles%2Fv0%2Fb%2Fgitbook-x-prod.appspot.com%2Fo%2Fspaces%252FiQhC2ch1UxeZmjicY4AZ%252Flogo%252F0dg1bYxmPe2B09BYbWGz%252FlogoForDocs.png%3Falt%3Dmedia%26token%3Dd8974505-127d-4b4e-a15e-06ce372a2618",
              }}
              style={{ width: 48, height: 24 }}
            />
          </View>
        ) : item.market === "Citrus" ? (
          <View style={tw`absolute top-0 right-0 p-1`}>
            <Image
              source={{
                uri: "https://citrus.famousfoxes.com/img/citrus-logo.png",
              }}
              style={{ width: 50, height: 22 }}
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
      {displayedItems.length > 0 ? (
        <>
          <FlatList
            data={displayedItems}
            keyExtractor={(item) => item.transactionId}
            numColumns={2} // specify the number of columns
            renderItem={renderOpenBorrowingItem}
          />
          {displayedItems.length < openBorrowingData.length && (
            <TouchableOpacity
              onPress={showMoreItems}
              style={tw`mt-4 mb-8 bg-blue-500 px-6 py-2 rounded-full`}
            >
              <Text style={tw`text-white font-bold text-sm`}>Show more</Text>
            </TouchableOpacity>
          )}
        </>
      ) : (
        <Text>No open lending account data found.</Text>
      )}
    </Screen>
  );
}
