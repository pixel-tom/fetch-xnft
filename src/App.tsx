import { registerRootComponent } from "expo";
import { RecoilRoot } from "recoil";
import { ActivityIndicator, View, TouchableOpacity, Text } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { useFonts, PressStart2P_400Regular } from "@expo-google-fonts/dev";
import { LendingScreen } from "./screens/LendingScreen";
import { TokenListNavigator } from "./screens/TokenNavigator";
import { BorrowingScreen } from "./screens/BorrowingScreen";
import { StackHeaderProps } from "@react-navigation/stack";
import { Image } from "react-native";



const Stack = createStackNavigator();

function Header({ navigation, route }: StackHeaderProps) {
  const activeTabStyle = {
    color: "white",
    fontWeight: "bold" as "bold",
    paddingHorizontal: 20,
    paddingVertical: 10,
  };

  const inactiveTabStyle = {
    color: "white",
    fontWeight: "normal" as "normal",
    paddingHorizontal: 20,
    paddingVertical: 10,
  };

  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: "#0F0F0F",
        paddingTop: 15,
        paddingBottom: 10,
        paddingHorizontal: 15,
        elevation: 4,
      }}
    >
      {/* Placeholder logo */}
      <Image
        source={{ uri: "https://via.placeholder.com/50x30" }}
        style={{ width: 50, height: 30 }}
      />

      {/* Spacer to move buttons to the right */}
      <View style={{ flex: 1 }} />

      <TouchableOpacity onPress={() => navigation.navigate("Lending")}>
        <Text style={route.name === "Lending" ? activeTabStyle : inactiveTabStyle}>Lending</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate("Borrowing")}>
        <Text style={route.name === "Borrowing" ? activeTabStyle : inactiveTabStyle}>Borrowing</Text>
      </TouchableOpacity>
    </View>
  );
}




function App() {
  let [fontsLoaded] = useFonts({
    PressStart2P_400Regular,
  });

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <RecoilRoot>
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="Lending"
          screenOptions={{
            header: (props) => <Header {...props} />,
            headerTitleAlign: "center",
            headerStyle: {
              backgroundColor: "black",
            },
            headerTintColor: "white",
          }}
        >
          <Stack.Screen name="Lending" component={LendingScreen} />
          <Stack.Screen name="Borrowing" component={BorrowingScreen} />
          <Stack.Screen name="List" component={TokenListNavigator} />
        </Stack.Navigator>
      </NavigationContainer>
    </RecoilRoot>
  );
}

export default registerRootComponent(App);
