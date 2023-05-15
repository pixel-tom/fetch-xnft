import { registerRootComponent } from "expo";
import { RecoilRoot } from "recoil";
import { ActivityIndicator, View, TouchableOpacity, Text } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { useFonts, PressStart2P_400Regular } from "@expo-google-fonts/dev";
import { LendingScreen } from "./screens/LendingScreen";
import { BorrowingScreen } from "./screens/BorrowingScreen";
import { StackHeaderProps } from "@react-navigation/stack";
import { Image } from "react-native";

const Stack = createStackNavigator();

function Header({ navigation, route }: StackHeaderProps) {
  const activeTabStyle = {
    color: "white",
    border: "1px solid #111111",
    borderRadius: "4px",
    fontWeight: "bold" as "bold",
    paddingHorizontal: 20,
    paddingVertical: 10,
    background: "linear-gradient(#0F0F0F, #222222)",
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
        paddingTop: 10,
        paddingBottom: 10,
        paddingRight: 87,
        paddingHorizontal: 15,
        elevation: 4,
      }}
    >
      {/* Placeholder logo */}
      <Image
        source={require("../assets/doge-logo.png")}
        style={{ width: 50, height: 40 }}
      />

      {/* Spacer to move buttons to the right */}
      <View style={{ flex: 1 }} />

      <TouchableOpacity onPress={() => navigation.navigate("Lending")}>
        <Text
          style={route.name === "Lending" ? activeTabStyle : inactiveTabStyle}
        >
          Lending
        </Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate("Borrowing")}>
        <Text
          style={route.name === "Borrowing" ? activeTabStyle : inactiveTabStyle}
        >
          Borrowing
        </Text>
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
              backgroundColor: "white",
            },
            headerTintColor: "white",
          }}
        >
          <Stack.Screen name="Lending" component={LendingScreen} />
          <Stack.Screen name="Borrowing" component={BorrowingScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </RecoilRoot>
  );
}

export default registerRootComponent(App);
