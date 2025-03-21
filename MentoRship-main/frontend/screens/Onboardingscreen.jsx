import AppIntroSlider from "react-native-app-intro-slider";
import { SIZES } from "../constants/theme";
import { useEffect, useState, useContext } from "react";
import { Image, SafeAreaView, TouchableOpacity } from "react-native";
import { StyleSheet, Text, View } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { UserType } from "../UserContext";
import tw from "twrnc";

export default function Onboarding({ navigation }) {
  const { userId, setUserId } = useContext(UserType);
  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        const token = await AsyncStorage.getItem("authToken");
        const userId = await AsyncStorage.getItem("userId");
        if (token && userId) {
          // Update UserContext with userId if available
          setUserId(userId);
          navigation.replace("Chat");
        } else {
          // Token Not Found
        }
      } catch (error) {
        console.log(error);
      }
    };
    checkLoginStatus();
  }, []);
  const handleGetStarted = () => {
    navigation.navigate("Signup");
  };
  const handleSkip = () => {
    navigation.navigate("Login");
  };
  return (
    <SafeAreaView style={tw`flex-1 mt-20 items-center pb-20`}>
      <Image
        source={require("../assets/ship-boarding.jpg")}
        style={{
          width: 320,
          height: 320,
          borderRadius: 10,
          marginTop: 20,
        }}
      />
      <Text
        style={{
          fontWeight: "bold",
          color: "#333333",
          fontSize: 28,
          marginBottom: 20,
          marginTop: 60,
        }}
      >
        Sail with your Mentors
      </Text>
      <Text
        style={{
          width: 300,
          fontSize: 14,
          color: "#677294",
          textAlign: "center",
          marginBottom: 50,
        }}
      >
        The Mentor App seamlessly connects users with experienced mentors for
        personalized guidance in their professional or personal pursuits.{" "}
      </Text>
      <TouchableOpacity
        onPress={handleGetStarted}
        style={{
          width: 300,
          height: 50,
          backgroundColor: "#09A1F6",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: 10,
        }}
      >
        <Text
          style={{
            color: "#ffffff",
            fontSize: 18,
            fontWeight: "bold",
          }}
        >
          Getting Started
        </Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={handleSkip}>
        <Text
          style={{
            color: "#677294",
            fontSize: 14,
            marginTop: 10,
          }}
        >
          Skip
        </Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}
