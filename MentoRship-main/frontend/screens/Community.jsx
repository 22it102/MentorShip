import React, { useState } from "react";
import {
  View,
  Text,
  Platform,
  StatusBar,
  FlatList,
  Pressable,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation } from "@react-navigation/native";
import MembersComponent from "../components/MembersComponent";
import SessionsComponent from "../components/SessionsComponent";
import TopicsComponent from "../components/TopicsComponent";
import CompaniesComponent from "../components/CompaniesComponent";
import AllComponents from "../components/AllComponents";

const data = [
  { id: 1, text: "All" },
  { id: 2, text: "Members" },
  { id: 3, text: "Sessions" },
  { id: 4, text: "Topics" },
  { id: 5, text: "Companies/Orgs" },
];

export default function Community() {
  const [selectedOption, setSelectedOption] = useState("All");
  const [flatListHeight, setFlatListHeight] = useState(50);

  const renderComponent = () => {
    switch (selectedOption) {
      case "Members":
        return <MembersComponent />;
      case "Sessions":
        return <SessionsComponent />;
      default:
        return <AllComponents />;
    }
  };

  const renderItem = ({ item }) => (
    <Pressable
      style={{
        paddingVertical: 10,
        paddingHorizontal: 12,
        borderBottomWidth: 3,
        borderColor: selectedOption === item.text ? "#5DC8D7" : "transparent",
      }}
      onPress={() => {
        setSelectedOption(item.text);
        if (item.text === "Members") {
          setFlatListHeight(50);
          setTimeout(() => {
            setFlatListHeight(100);
          }, 600);
        } else {
          setFlatListHeight(50);
        }
      }}
    >
      <Text
        style={{
          fontSize: 16,
          fontWeight: "bold",
          textAlign: "left",
        }}
      >
        {item.text}
      </Text>
    </Pressable>
  );

  return (
    <LinearGradient
      colors={["#000000", "#007CB0"]}
      style={{ flex: 1 }}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
      locations={[0.3, 1]}
    >
      <StatusBar barStyle="light-content" />
      <View style={{ flex: 1 }}>
        <Text
          style={{
            fontSize: 25,
            fontWeight: "bold",
            color: "#FFFFFF",
            marginTop: Platform.OS === "ios" ? 55 : 45,
            marginLeft: 20,
          }}
        >
          Community
        </Text>

        <View
          style={{
            borderTopLeftRadius: 50,
            borderTopRightRadius: 50,
            backgroundColor: "#FFFFFF",
            marginTop: 20,
          }}
        >
          <FlatList
            data={data}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderItem}
            style={{
              height: flatListHeight,
              marginTop: 12,
              marginLeft: 20,
              marginRight: 20,
              marginBottom: 10,
            }}
            contentContainerStyle={{ paddingRight: 20 }}
          />
          {renderComponent()}
        </View>
      </View>
    </LinearGradient>
  );
}
