import React, { useState } from "react";
import { View, TouchableOpacity, Text } from "react-native";
import tw from "twrnc";

const DropdownSlider = ({ navigation }: any) => {
  const [expanded, setExpanded] = useState(false);

  const dropdownItems = expanded ? (
    <View
      style={{
        flexDirection: "column",
        backgroundColor: "#0F0F0F",
        elevation: 4,
      }}
    >
      <TouchableOpacity
        onPress={() => navigation.navigate("Main", { screen: "Lending" })}
      >
        <Text style={{ color: "white", padding: 10 }}>Lending</Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => navigation.navigate("Main", { screen: "Borrowing" })}
      >
        <Text style={{ color: "white", padding: 10 }}>Borrowing</Text>
      </TouchableOpacity>
    </View>
  ) : null;

  return (
    <View>
      <TouchableOpacity
        onPress={() => setExpanded(!expanded)}
        style={{ marginRight: 15 }}
      >
        <Text style={tw`text-white p-[10px] mt-1`}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            x="0px"
            y="0px"
            width="20"
            height="20"
            viewBox="0,0,256,256"
          >
            <g
              fill="#fffbf7"
              fill-rule="nonzero"
              stroke="none"
              stroke-width="1"
              stroke-linecap="butt"
              stroke-linejoin="miter"
              stroke-miterlimit="10"
              stroke-dasharray=""
              stroke-dashoffset="0"
              font-family="none"
              font-weight="none"
              font-size="none"
              text-anchor="none"
            >
              <g transform="scale(5.12,5.12)">
                <path d="M0,7.5v5h50v-5zM0,22.5v5h50v-5zM0,37.5v5h50v-5z"></path>
              </g>
            </g>
          </svg>
        </Text>
      </TouchableOpacity>
      {dropdownItems}
    </View>
  );
};

export default DropdownSlider;
