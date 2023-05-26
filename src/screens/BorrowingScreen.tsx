import {
  Text,
  View,
  FlatList,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
} from "react-native";
import { usePublicKey } from "react-xnft";
import tw from "twrnc";
import { useState, useEffect } from "react";
import fetchBorrowingAccounts from "../utils/fetchBorrowingAccounts";
import { fetchUserStats } from "../utils/fetchRainfiData";
import { Screen } from "../components/Screen";
import { BorrowingData, Loan } from "../types/types";
import { Image, ScrollView } from "react-native";
import axios from "axios";

export function BorrowingScreen() {
  const publicKey = usePublicKey();
  // const publicKey = "HLFM7GmwN4NXvK2SuhmLFiADHq8UdK6i4uNxgkRD5aT5";
  const [username, setUsername] = useState("");
  const [openBorrowingData, setOpenBorrowingData] = useState<BorrowingData[]>(
    []
  );
  const [displayedItems, setDisplayedItems] = useState<BorrowingData[]>([]);
  const [loading, setLoading] = useState(true);

  const styles = StyleSheet.create({
    cardContainer: {
      width: Dimensions.get("window").width / 2 - 24,
      margin: "auto",
      padding: 8,
    },
  });

  useEffect(() => {
    const fetchUsername = async () => {
      try {
        const response = await axios.get(
          `https://xnft-api-server.xnfts.dev/v1/users/fromPubkey?blockchain=solana&publicKey=${publicKey.toString()}`
        );
        setUsername(response.data.user.username);
      } catch (error) {
        console.error("Error fetching username:", error);
      }
    };

    fetchUsername();
  }, [publicKey]);

  useEffect(() => {
    const fetchBorrowingData = async () => {
      const borrowingData = await fetchBorrowingAccounts(publicKey.toString());
      const rainfiData = await fetchUserStats(publicKey.toString());
      let allData;
      if (rainfiData) {
        // If rainfiData is not null
        allData = [...borrowingData, ...rainfiData]; // Spread both arrays into a new array
      } else {
        allData = [...borrowingData]; // If rainfiData is null, just spread borrowingData
      }
      setOpenBorrowingData(allData);
      setDisplayedItems(allData.slice(0, 10));
      setLoading(false);
    };
    fetchBorrowingData();
  }, []);

  const showMoreItems = () => {
    const currentLength = displayedItems.length;
    const newItems = openBorrowingData.slice(currentLength, currentLength + 10);
    setDisplayedItems([...displayedItems, ...newItems]);
  };

  const renderOpenBorrowingItem = ({ item }: { item: BorrowingData }) => {
    const loanDurationDays = item.accountAddress
      ? Math.round(item.duration / 86400)
      : Math.round(item.loanDurationSeconds / 86400);
    const principalAmountSol = item.accountAddress
      ? item.amount / 10 ** 9
      : item.principalAmount / 10 ** 9;
    const amountToRepaySol = item.accountAddress
      ? (item.interest + item.amount) / 10 ** 9
      : item.amountToRepay / 10 ** 9;
    const interestDueSol = item.accountAddress
      ? (item.interest / 10 ** 9).toFixed(2)
      : (amountToRepaySol - principalAmountSol).toFixed(2);

    const totalRepay = amountToRepaySol.toFixed(2);

    let apy;

    if (item.accountAddress) {
      const loanAmount = item.amount / 10 ** 9; // convert to Sol
      const amountToRepaySol = (item.interest + item.amount) / 10 ** 9; // convert to Sol
      const totalInterest = amountToRepaySol - loanAmount;

      const loanDurationDays = Math.round(item.duration / 86400);
      const loanDurationYears = loanDurationDays / 365; // convert days to years

      const interestRate = totalInterest / loanAmount / loanDurationYears;
      apy = (Math.pow(1 + interestRate, loanDurationYears) - 1) * 10000;
    } else {
      apy = item.apy || null;
    }

    if (item.market === "Frakt" && apy === null) {
      const interest = amountToRepaySol - principalAmountSol;
      apy =
        ((1 + interest / principalAmountSol) ** (365 / loanDurationDays) - 1) *
        100;
    }

    let remainingTimeDays, remainingTimeHours, remainingTimeMinutes;

    if (item.accountAddress) {
      const loanEndTimestamp = new Date(
        item.createdAt * 1000 + item.duration * 1000
      ).getTime();

      let remainingTimeSeconds = Math.max(
        (loanEndTimestamp - Date.now()) / 1000,
        0
      );

      remainingTimeDays = Math.floor(remainingTimeSeconds / 86400);
      remainingTimeSeconds %= 86400;
      remainingTimeHours = Math.floor(remainingTimeSeconds / 3600);
      remainingTimeSeconds %= 3600;
      remainingTimeMinutes = Math.floor(remainingTimeSeconds / 60);
    } else {
      const currentTimestamp = Date.now();
      const loanDurationSeconds = item.loanDurationSeconds || 0;
      const loanEndTimestamp = item.offerBlocktime
        ? item.offerBlocktime * 1000 + loanDurationSeconds * 1000
        : currentTimestamp + loanDurationSeconds * 1000;

      let remainingTimeSeconds =
        Math.max(loanEndTimestamp - currentTimestamp, 0) / 1000;

      remainingTimeDays = Math.floor(remainingTimeSeconds / 86400);
      remainingTimeSeconds %= 86400;
      remainingTimeHours = Math.floor(remainingTimeSeconds / 3600);
      remainingTimeSeconds %= 3600;
      remainingTimeMinutes = Math.floor(remainingTimeSeconds / 60);
    }

    return (
      <View
        style={[
          tw`mb-3 p-0 bg-[#0F0F0F] border border-[#222222] rounded-lg`,
          styles.cardContainer,
        ]}
      >
        <View>
          <View style={tw`w-full relative`}>
            <Image
              source={{
                uri: item.accountAddress
                  ? `https://cdn.hellomoon.io/nft/${item.mint}?apiKey=151c15b0-d21d-40b2-9786-49678176b715&format=webp&width=500&height=500`
                  : `https://cdn.hellomoon.io/nft/${item.collateralMint}?apiKey=151c15b0-d21d-40b2-9786-49678176b715&format=webp&width=500&height=500`,
              }}
              style={{ width: "100%", aspectRatio: 1, borderRadius: 4 }}
            />
            <View style={tw`absolute top-0 left-0 p-1`}>
              <View style={tw`bg-black bg-opacity-50 p-1 rounded`}>
                <Text style={tw`text-[10px] font-bold text-white`}>Loan</Text>
                <View style={tw`flex-row items-center`}>
                  <Text style={tw`text-[10px] font-bold text-white`}>
                    {principalAmountSol.toFixed(2) + " "}
                  </Text>
                  <Image
                    source={require("/assets/sol.png")}
                    style={{ width: 9, height: 7 }}
                  />
                </View>
              </View>
            </View>
            <View style={tw`absolute bottom-0 right-0 p-1`}>
              <View style={tw`bg-black bg-opacity-50 p-1 rounded`}>
                <Text style={tw`text-[10px] font-bold text-white`}>APY</Text>
                <Text style={tw`text-[11px] text-gray-300`}>
                  {apy ? apy.toFixed(0) + " %" : "N/A"}
                </Text>
              </View>
            </View>
            <View style={tw`absolute bottom-0 left-0 p-1`}>
              <View style={tw`bg-black bg-opacity-50 p-1 rounded`}>
                <Text style={tw`text-[10px] font-bold text-white`}>Term</Text>
                <Text style={tw`text-[11px] text-gray-300`}>
                  {loanDurationDays} Days
                </Text>
              </View>
            </View>
          </View>

          <View style={tw`px-2 pt-3 pb-1 w-full`}>
            <Text style={tw`text-xs font-bold text-indigo-100`}>
              Interest Due
            </Text>
            <Text style={tw`text-sm text-red-300`}>
              - {interestDueSol} SOL
            </Text>
          </View>
          <View style={tw`px-2 py-1 w-full`}>
            <Text style={tw`text-xs font-bold text-indigo-100`}>
              Total Repay
            </Text>
            <Text style={tw`text-sm text-gray-100`}>{totalRepay} SOL</Text>
          </View>
          <View style={tw`px-2 pb-3 pt-1 w-full`}>
            <Text style={tw`text-xs font-bold text-indigo-100`}>
              Time Remaining
            </Text>
            <Text style={tw`text-sm font-bold text-gray-200`}>
              {remainingTimeDays}D {remainingTimeHours}H {remainingTimeMinutes}M
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
              <Image
                source={{
                  uri: "https://i.ibb.co/fCpnvzQ/rain-simple-logo.png",
                }}
                style={{ width: 15, height: 22 }}
              />
            </View>
          )}
        </View>
      </View>
    );
  };

  const totalInterestDue = openBorrowingData.reduce((total, item) => {
    const principalAmountSol = item.accountAddress
      ? item.amount / 10 ** 9
      : item.principalAmount / 10 ** 9;
    const amountToRepaySol = item.accountAddress
      ? (item.interest + item.amount) / 10 ** 9
      : item.amountToRepay / 10 ** 9;
    const interestDueSol = item.accountAddress
      ? item.interest / 10 ** 9
      : amountToRepaySol - principalAmountSol;

    return total + interestDueSol;
  }, 0);

  const scrollIndicatorStyle = {
    ...Platform.select({
      ios: {
        backgroundColor: "darkgray",
        width: 5,
        marginRight: 2,
      },
      android: {
        backgroundColor: "darkgray",
        width: 5,
      },
    }),
  };

  return (
    <Screen style={tw`bg-black`}>
      <ScrollView scrollIndicatorInsets={scrollIndicatorStyle}>
        {loading ? ( // Show loading spinner when loading is true
          <View style={tw`flex items-center justify-center h-20`}>
            <ActivityIndicator color="white" size="large" />
          </View>
        ) : displayedItems.length > 0 ? (
          <>
            <View style={tw`mb-6`}>
              <Text style={tw`text-lg  mt-2 mb-4 ml-3 font-bold text-gray-100`}>
                Welcome Back, @{username || publicKey.toString()}.
              </Text>
              <View style={tw`flex-row bg-[#0F0F0F] rounded-md py-2 px-4 mx-2`}>
                <View>
                  <Text style={tw`text-sm font-bold text-gray-300`}>
                    Total Interest
                  </Text>
                  <View style={tw`flex-row`}>
                    <Text style={tw`text-2xl font-bold text-red-400 mt-1`}>
                      - {totalInterestDue.toFixed(2)}
                    </Text>
                    <Image
                      source={require("/assets/sol-gradient.png")}
                      style={tw`w-6 h-6 ml-1 mt-[10px]`}
                    />
                  </View>
                </View>
                <View style={tw`ml-18`}>
                  <Text style={tw`text-sm font-bold text-gray-300`}>
                    Active Loans
                  </Text>
                  <Text style={tw`text-2xl font-bold text-white mt-1`}>
                    {openBorrowingData.length}
                  </Text>
                </View>
              </View>
            </View>

            <View style={tw`flex flex-row flex-wrap justify-around`}>
              <FlatList
                data={displayedItems}
                renderItem={renderOpenBorrowingItem}
                keyExtractor={(item, index) => index.toString()}
                onEndReached={showMoreItems}
                onEndReachedThreshold={0.5}
                numColumns={2}
              />
            </View>

            {displayedItems.length < openBorrowingData.length && (
              <TouchableOpacity
                onPress={showMoreItems}
                style={tw`mt-4 mb-8 border border-gray-400 text-center bg-none px-6 py-2 rounded-full`}
              >
                <Text style={tw`text-white font-bold text-sm`}>Show more</Text>
              </TouchableOpacity>
            )}
          </>
        ) : (
          <View style={tw`flex items-center justify-center h-20`}>
            <Text style={tw`text-gray-500 text-sm`}>
              No open borrowing account data found.
            </Text>
          </View>
        )}
      </ScrollView>
    </Screen>
  );
}
