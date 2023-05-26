import { registerRootComponent } from "expo";
import { RecoilRoot } from "recoil";
import { ActivityIndicator, View, TouchableOpacity, Text } from "react-native";
import { NavigationContainer, DefaultTheme } from "@react-navigation/native";
import { createStackNavigator, TransitionPresets } from "@react-navigation/stack";
import { useFonts, PressStart2P_400Regular } from "@expo-google-fonts/dev";
import { LendingScreen } from "./screens/LendingScreen";
import { BorrowingScreen } from "./screens/BorrowingScreen";
import { StackHeaderProps } from "@react-navigation/stack";
import { Image } from "react-native";
import "./styles/styles.css";
global.Buffer = global.Buffer || require('buffer').Buffer;

const MainStack = createStackNavigator();
const NestedStack = createStackNavigator();

const MyTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: '#000000',
  },
};

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
      <Image
        source={require("../assets/fetch-app-logo.png")}
        style={{ width: 75, height: 40 }}
      />

      <View style={{ flex: 1 }} />
      <TouchableOpacity onPress={() => navigation.navigate('Main', {screen: 'Lending'})}>
        <Text
          style={route.name === "Lending" ? activeTabStyle : inactiveTabStyle}
        >
          Lending
        </Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate('Main', {screen: 'Borrowing'})}>
        <Text
          style={route.name === "Borrowing" ? activeTabStyle : inactiveTabStyle}
        >
          Borrowing
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const NestedNavigator = () => {
  return (
    <NestedStack.Navigator
      initialRouteName="Lending"
      screenOptions={{
        headerShown: false,
        ...TransitionPresets.SlideFromRightIOS,
        cardStyle: { backgroundColor: '#000000' } 
      }}
    >
      <NestedStack.Screen name="Lending" component={LendingScreen} />
      <NestedStack.Screen name="Borrowing" component={BorrowingScreen} />
    </NestedStack.Navigator>
  );
};

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
      <NavigationContainer theme={MyTheme}>
        <MainStack.Navigator
          initialRouteName="Main"
          screenOptions={{
            header: (props) => <Header {...props} />,
            headerTitleAlign: "center",
            headerStyle: {
              backgroundColor: "#0F0F0F",
            },
            headerTintColor: "white",
          }}
        >
          <MainStack.Screen name="Main" component={NestedNavigator} />
        </MainStack.Navigator>
      </NavigationContainer>
    </RecoilRoot>
  );
}

export default registerRootComponent(App);
