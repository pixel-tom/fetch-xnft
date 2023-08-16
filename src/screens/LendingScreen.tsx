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
import tw from "twrnc";
import { useState, useEffect } from "react";
import fetchLendingAccounts from "../utils/fetchLendingAccounts";
import { fetchUserStats } from "../utils/fetchRainfiLendingData";
import { Screen } from "../components/Screen";
import { LendingData } from "../types/types";
import { Image, ScrollView } from "react-native";
import { usePublicKey } from "react-xnft";
import axios from "axios";

const globalStyles = {
  customFont: {
    fontFamily: "RedHatDisplay_400Regular",
  },
};

export function LendingScreen() {
  // const publicKey = usePublicKey();
  const publicKey = "5u2Pw5kYjo9NLPHphKwcR3HH63jSV65jCWuChNjTMN9g";
  const [username, setUsername] = useState("");
  const [openLendingData, setOpenLendingData] = useState<LendingData[]>([]);
  const [displayedItems, setDisplayedItems] = useState<LendingData[]>([]);
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
        console.log(response);
        setUsername(response.data.user.username);
      } catch (error) {
        console.error("Error fetching username:", error);
      }
    };

    fetchUsername();
  }, [publicKey]);

  useEffect(() => {
    const fetchLendingData = async () => {
      const lendingData = await fetchLendingAccounts(publicKey.toString());
      const rainfiData = await fetchUserStats(publicKey.toString());
      let allData;
      if (rainfiData) {
        // If rainfiData is not null
        allData = [...lendingData, ...rainfiData]; // Spread both arrays into a new array
      } else {
        allData = [...lendingData]; // If rainfiData is null, just spread borrowingData
      }
      setOpenLendingData(allData);
      setDisplayedItems(allData.slice(0, 10));
      setLoading(false);
    };
    fetchLendingData();
  }, []);

  const showMoreItems = () => {
    const currentLength = displayedItems.length;
    const newItems = openLendingData.slice(currentLength, currentLength + 10);
    setDisplayedItems([...displayedItems, ...newItems]);
  };

  const renderOpenItem = ({ item }: { item: LendingData }) => {
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
          tw`mb-4 p-0 bg-[#0F0F0F] border border-[#222222] rounded-lg`,
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
                <Text
                  style={[
                    tw`text-[9px] font-semibold text-white`,
                    globalStyles.customFont,
                  ]}
                >
                  Loan
                </Text>
                <View style={tw`flex-row items-center`}>
                  <Text
                    style={[
                      tw`text-[11px] font-semibold text-white`,
                      globalStyles.customFont,
                    ]}
                  >
                    {principalAmountSol.toFixed(2) + " "}
                  </Text>
                  <View>
                    <Image
                      source={require("/assets/sol.png")}
                      style={{ width: 9, height: 7 }}
                    />
                  </View>
                </View>
              </View>
            </View>
            <View style={tw`absolute bottom-0 right-0 p-1`}>
              <View style={tw`bg-black bg-opacity-50 p-1 rounded`}>
                <Text
                  style={[
                    tw`text-[9px] font-semibold text-white`,
                    globalStyles.customFont,
                  ]}
                >
                  APY
                </Text>
                <Text
                  style={[
                    tw`text-[11px] text-gray-300`,
                    globalStyles.customFont,
                  ]}
                >
                  {apy ? apy.toFixed(0) + " %" : "N/A"}
                </Text>
              </View>
            </View>
            <View style={tw`absolute bottom-0 left-0 p-1`}>
              <View style={tw`bg-black bg-opacity-50 p-1 rounded`}>
                <Text
                  style={[
                    tw`text-[9px] font-semibold text-white`,
                    globalStyles.customFont,
                  ]}
                >
                  Term
                </Text>
                <Text
                  style={[
                    tw`text-[11px] text-gray-300`,
                    globalStyles.customFont,
                  ]}
                >
                  {loanDurationDays} Days
                </Text>
              </View>
            </View>
          </View>

          <View style={tw`w-full flex-row pt-2 pb-1 px-2 text-center`}>
            <View style={tw`w-1/2 py-1 pb-1`}>
              <View>
                <Text
                  style={[
                    tw`text-[10px] text-gray-400`,
                    globalStyles.customFont,
                  ]}
                >
                  Interest Due
                </Text>
              </View>
              <Text
                style={[
                  tw`text-sm font-semibold text-green-400`,
                  globalStyles.customFont,
                ]}
              >
                + {interestDueSol}
                <Image
                  source={require("/assets/sol-gradient.png")}
                  style={tw`w-[14px] h-[10px] ml-1 mt-1`}
                />
              </Text>
            </View>
            <View style={tw`w-1/2 py-1 border-left border-gray-700`}>
              <Text
                style={[tw`text-[10px] text-gray-400`, globalStyles.customFont]}
              >
                Total Repay
              </Text>
              <Text
                style={[
                  tw`text-sm font-semibold text-gray-100`,
                  globalStyles.customFont,
                ]}
              >
                {totalRepay}
                <Image
                  source={require("/assets/sol-gradient.png")}
                  style={tw`w-[14px] h-[10px] ml-1 mt-1`}
                />
              </Text>
            </View>
          </View>

          <View style={tw`bg-[#000000] bg-opacity-30 mx-2 mb-2 rounded-lg`}>
            <View style={tw`px-2 py-1 w-full`}>
              <Text
                style={[
                  tw`text-[10px] font-bold text-gray-400 text-center`,
                  globalStyles.customFont,
                ]}
              >
                Time Remaining
              </Text>
              <Text
                style={[
                  tw`text-[18px] font-semibold text-gray-200 text-center`,
                  globalStyles.customFont,
                ]}
              >
                {remainingTimeDays}D {remainingTimeHours}H{" "}
                {remainingTimeMinutes}M
              </Text>
            </View>
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

  const totalInterestDue = openLendingData.reduce((total, item) => {
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

  const totalLoanValue = openLendingData.reduce((total, item) => {
    const principalAmountSol = item.accountAddress
      ? item.amount / 10 ** 9
      : item.principalAmount / 10 ** 9;

    return total + principalAmountSol;
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
    <Screen style={tw`bg-[#020202]`}>
      <ScrollView scrollIndicatorInsets={scrollIndicatorStyle}>
        {loading ? (
          <View style={tw`flex items-center justify-center h-20`}>
            <ActivityIndicator color="white" size="large" />
          </View>
        ) : displayedItems.length > 0 ? (
          <>
            <View style={tw`mb-6 mx-2`}>
              <Text
                style={[
                  tw`text-xl mt-2 mb-4 ml-2 font-semibold text-gray-100`,
                  globalStyles.customFont,
                ]}
              >
                Welcome Back, @{username || publicKey.toString()}.
              </Text>
              <View
                style={tw`flex-row bg-[#0F0F0F] rounded-md py-2 px-2 text-center`}
              >
                <View style={tw`w-2/5 items-center`}>
                  <Text
                    style={[
                      tw`text-xs font-semibold text-gray-300`,
                      globalStyles.customFont,
                    ]}
                  >
                    Total Loan Value
                  </Text>
                  <View style={tw`flex-row`}>
                    <Text
                      style={[
                        tw`text-[26px] font-semibold text-white mt-1`,
                        globalStyles.customFont,
                      ]}
                    >
                      {totalLoanValue.toFixed(2)}
                    </Text>
                    <Image
                      source={require("/assets/sol-gradient.png")}
                      style={tw`w-6 h-6 ml-1 my-auto mb-[5px]`}
                    />
                  </View>
                </View>
                <View style={tw`w-2/5 items-center`}>
                  <Text
                    style={[
                      tw`text-xs font-semibold text-gray-300`,
                      globalStyles.customFont,
                    ]}
                  >
                    Total Interest
                  </Text>
                  <View style={tw`flex-row`}>
                    <Text
                      style={[
                        tw`text-[26px] font-semibold text-green-400 mt-1`,
                        globalStyles.customFont,
                      ]}
                    >
                      + {totalInterestDue.toFixed(2)}
                    </Text>
                    <Image
                      source={require("/assets/sol-gradient.png")}
                      style={tw`w-6 h-6 ml-1 my-auto mb-[5px]`}
                    />
                  </View>
                </View>
                <View style={tw`w-1/5`}>
                  <Text
                    style={[
                      tw`text-xs font-semibold text-gray-300`,
                      globalStyles.customFont,
                    ]}
                  >
                    Active
                  </Text>
                  <Text
                    style={[
                      tw`text-[26px] font-semibold text-white mt-1`,
                      globalStyles.customFont,
                    ]}
                  >
                    {openLendingData.length}
                  </Text>
                </View>
              </View>
            </View>
            <FlatList
              data={displayedItems}
              renderItem={renderOpenItem}
              keyExtractor={(item, index) => index.toString()}
              onEndReached={showMoreItems}
              onEndReachedThreshold={0.5}
              numColumns={2}
            />
            {displayedItems.length < openLendingData.length && (
              <TouchableOpacity
                onPress={showMoreItems}
                style={tw`mt-4 mb-8 border border-slate-400 text-center bg-none px-6 py-2 rounded-full`}
              >
                <Text
                  style={[
                    tw`text-white font-bold text-sm`,
                    globalStyles.customFont,
                  ]}
                >
                  Show more
                </Text>
              </TouchableOpacity>
            )}
          </>
        ) : (
          <View style={tw`flex items-center justify-center h-20`}>
            <Text style={[tw`text-slate-500 text-sm`, globalStyles.customFont]}>
              No open lending account data found.
            </Text>
          </View>
        )}
      </ScrollView>
    </Screen>
  );
}
