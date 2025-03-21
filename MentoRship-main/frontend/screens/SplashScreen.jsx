import React, { useContext, useEffect } from "react";
import { View, Image, StyleSheet, StatusBar } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { UserType } from "../UserContext";

const SplashScreen = ({ navigation }) => {
  const { userId, setUserId } = useContext(UserType);

  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        const token = await AsyncStorage.getItem("authToken");
        const userId = await AsyncStorage.getItem("userId");
        if (token && userId) {
          // Update UserContext with userId if available
          setUserId(userId);
          setTimeout(() => {
            navigation.replace("Community");
          }, 1000);
        } else {
          navigation.navigate("Onboarding");
        }
      } catch (error) {
        console.log(error);
      }
    };
    checkLoginStatus();
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <Image
        source={require("../assets/01_Splash_screen.jpg")}
        style={styles.image}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  image: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
});

export default SplashScreen;
