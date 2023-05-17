import {
  Text,
  View,
  FlatList,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import tw from "twrnc";
import { useState, useEffect } from "react";
import fetchLendingAccounts from "../utils/fetchLendingAccounts";
import { Screen } from "../components/Screen";
import { LendingData } from "../types/types";
import { Image } from "react-native";
import { usePublicKey } from "react-xnft";
import axios from "axios";

export function LendingScreen() {
  const publicKey = usePublicKey();
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
    const fetchData = async () => {
      const data = await fetchLendingAccounts(publicKey.toString());
      setOpenLendingData(data);
      setDisplayedItems(data.slice(0, 10));
      setLoading(false);
    };
    fetchData();
  }, []);

  const showMoreItems = () => {
    const currentLength = displayedItems.length;
    const newItems = openLendingData.slice(currentLength, currentLength + 10);
    setDisplayedItems([...displayedItems, ...newItems]);
  };

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

  const renderOpenItem = ({ item }: { item: LendingData }) => {
    const loanDurationDays = Math.round(item.loanDurationSeconds / 86400);
    const principalAmountSol = item.principalAmount / 10 ** 9; // convert to Sol
    const amountToRepaySol = item.amountToRepay / 10 ** 9; // convert to Sol
    const now = Date.now() / 1000; // get the current time in seconds
    const endTime = (item.acceptBlocktime || now) + item.loanDurationSeconds; // calculate the end time in seconds

    let apy = item.apy;
    let interestDueSol = (amountToRepaySol - principalAmountSol).toFixed(3); // calculate interest and round to 3 decimal places

    if (item.market === "Frakt" && apy === null) {
      const interest = amountToRepaySol - principalAmountSol;
      apy =
        ((1 + interest / principalAmountSol) ** (365 / loanDurationDays) - 1) *
        100;
      interestDueSol = "0.00";
    }

    const getTimeRemaining = () => {
      const totalSeconds = Math.max(endTime - now, 0);
      const daysRemaining = Math.floor(totalSeconds / 86400);
      const hoursRemaining = Math.floor((totalSeconds % 86400) / 3600);
      const minutesRemaining = Math.floor((totalSeconds % 3600) / 60);
      return { daysRemaining, hoursRemaining, minutesRemaining };
    };

    const { daysRemaining, hoursRemaining, minutesRemaining } =
      getTimeRemaining();

    return (
      <View
        style={[
          tw`mb-3 p-0 w-full bg-[#0F0F0F] border border-[#222222] rounded-lg`,
          styles.cardContainer,
        ]}
      >
        <View style={tw`w-full relative`}>
          <Image
            source={{
              uri: `https://cdn.hellomoon.io/nft/${item.collateralMint}?apiKey=151c15b0-d21d-40b2-9786-49678176b715&format=webp&width=500&height=500`,
            }}
            style={{ width: "100%", aspectRatio: 1, borderRadius: 4 }}
          />
          <View style={tw`absolute top-0 left-0 p-2`}>
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
          <View style={tw`absolute bottom-0 right-0 p-2`}>
            <View style={tw`bg-black bg-opacity-50 p-1 rounded`}>
              <Text style={tw`text-[10px] font-bold text-white`}>APY</Text>
              <Text style={tw`text-[11px] text-gray-300`}>
                {apy ? apy.toFixed(0) + " %" : "N/A"}
              </Text>
            </View>
          </View>
          <View style={tw`absolute bottom-0 left-0 p-2`}>
            <View style={tw`bg-black bg-opacity-50 p-1 rounded`}>
              <Text style={tw`text-[10px] font-bold text-white`}>Term</Text>
              <Text style={tw`text-[11px] text-gray-300`}>
                {loanDurationDays} Days
              </Text>
            </View>
          </View>
        </View>

        <View style={tw`px-2 pb-1 pt-2 w-full`}>
          <Text style={tw`text-xs font-bold text-white`}>Interest Due</Text>
          <Text style={tw`text-xs text-green-400`}>+ {interestDueSol} SOL</Text>
        </View>
        <View style={tw`px-2 pt-1 pb-2 w-full`}>
          <Text style={tw`text-xs font-bold text-white`}>Time Remaining</Text>
          <Text style={tw`text-md font-bold text-gray-300`}>
            {daysRemaining}D {hoursRemaining}H {minutesRemaining}M
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

  const totalInterestDue = openLendingData.reduce(
    (total, item) =>
      total + (item.amountToRepay - item.principalAmount) / 10 ** 9,
    0
  );

  return (
    <Screen style={tw`bg-black`}>
      {loading ? ( // Show loading spinner when loading is true
        <View style={tw`flex items-center justify-center h-20`}>
          <ActivityIndicator color="white" size="large" />
        </View>
      ) : displayedItems.length > 0 ? (
        <>
          <View style={tw`mb-6`}>
            <Text style={tw`text-lg  mt-2 mb-4 ml-2 font-bold text-gray-100`}>
              Welcome Back, @{username || publicKey.toString()}.
            </Text>
            <View style={tw`flex-row bg-[#0F0F0F] rounded-md py-2 px-4 mx-2`}>
              <View>
                <Text style={tw`text-sm font-bold text-gray-300`}>
                  Total Interest
                </Text>
                <View style={tw`flex-row`}>
                  <Text style={tw`text-2xl font-bold text-green-400 mt-1`}>
                    + {totalInterestDue.toFixed(2)}
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
                  {openLendingData.length}
                </Text>
              </View>
            </View>
          </View>
          <FlatList
            data={displayedItems}
            keyExtractor={(item) => item.transactionId}
            numColumns={2} // specify the number of columns
            renderItem={renderOpenItem}
          />
          {displayedItems.length < openLendingData.length && (
            <TouchableOpacity
              onPress={showMoreItems}
              style={tw`mt-4 mb-8 border border-slate-400 text-center bg-none px-6 py-2 rounded-full`}
            >
              <Text style={tw`text-white font-bold text-sm`}>Show more</Text>
            </TouchableOpacity>
          )}
        </>
      ) : (
        <View style={tw`flex items-center justify-center h-20`}>
          <Text style={tw`text-slate-500 text-sm`}>
            No open lending account data found.
          </Text>
        </View>
      )}
    </Screen>
  );
}
