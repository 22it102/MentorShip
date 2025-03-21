import {
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  Touchable,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
} from "react-native";
import React, { useState, useContext } from "react";
import { Image } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import FlashMessage, { showMessage } from "react-native-flash-message";
import axios from "axios";
import jwt_decode from "jwt-decode";
import { UserType } from "../UserContext";

export default function Login({ navigation }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { userId, setUserId } = useContext(UserType);

  const showToast = () => {
    showMessage({
      message: "Success",
      description: "Login successful!",
      type: "success",
      duration: 3000,
      autoHide: true,
    });
  };
  const handleLogin = async () => {
    setLoading(true);
    const user = {
      email: email,
      password: password,
    };
    try {
      const response = await axios.post(
        `https://mentorship-backends-rahul-mistrys-projects.vercel.app/login`,
        user
      );
      const token = response.data.token;

      // Save token to AsyncStorage
      await AsyncStorage.setItem("authToken", token);

      const decodedToken = jwt_decode(token);
      const userId = decodedToken.userId;

      // Stringify userId before storing
      await AsyncStorage.setItem("userId", userId);
      setUserId(userId);

      navigation.replace("VerifyOTP");
    } catch (error) {
      if (error.response.status === 403) {
        // Account deactivated
        Alert.alert(
          "Account Deactivated",
          "Your account has been deactivated. Please contact support team."
        );
      } else if (error.response.status === 401) {
        // Invalid password
        Alert.alert("Login Error", "Invalid Email or Password");
        console.log(error);
      } else {
        // Other errors
        Alert.alert("Error", "An error occurred while logging in");
        console.log(error);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = () => {
    navigation.replace("Signup");
  };
  return (
    <SafeAreaView
      style={{
        flex: 1,
        alignItems: "center",
        marginTop: 70,
      }}
    >
      <FlashMessage position="bottom" />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Image
          source={require("../assets/Logo.png")}
          style={{
            height: 100,
            width: 100,
            marginBottom: 10,
          }}
        />
        <Text
          style={{
            fontSize: 48,
            fontWeight: "bold",
            color: "#000000",
          }}
        >
          MentoRship
        </Text>
        <Text
          style={{
            fontSize: 24,
            fontWeight: "bold",
            marginTop: 10,
          }}
        >
          Have an Account?
        </Text>
        <Text
          style={{
            fontSize: 15,
            marginTop: 10,
            marginBottom: 20,
          }}
        >
          Login with one of these services
        </Text>

        <View
          style={{
            flexDirection: "row",
            gap: 10,
          }}
        >
          <TouchableOpacity>
            <Image
              source={require("../assets/Google.png")}
              style={{
                height: 60,
                width: 60,
              }}
            />
          </TouchableOpacity>
          <TouchableOpacity>
            <Image
              source={require("../assets/Apple1.png")}
              style={{
                height: 60,
                width: 60,
              }}
            />
          </TouchableOpacity>
          <TouchableOpacity>
            <Image
              source={require("../assets/LinkedIn.png")}
              style={{
                height: 60,
                width: 60,
              }}
            />
          </TouchableOpacity>
        </View>
        <View
          style={{
            flexDirection: "row",
            gap: 15,
            marginTop: 10,
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <View
            style={{
              width: 100,
              height: 1.5,
              backgroundColor: "#09A1F6",
            }}
          ></View>
          <Text>or</Text>
          <View
            style={{
              width: 100,
              height: 1.5,
              backgroundColor: "#09A1F6",
            }}
          ></View>
        </View>
        <Text
          style={{
            fontSize: 16,
            marginTop: 10,
          }}
        >
          Login With Email
        </Text>

        <TextInput
          placeholder="Email:"
          style={{
            backgroundColor: "#D9D9D9",
            width: 290,
            height: 50,
            borderRadius: 20,
            marginTop: 15,
            paddingHorizontal: 20,
          }}
          onChangeText={(text) => setEmail(text)}
        ></TextInput>
        <TextInput
          secureTextEntry
          placeholder="Password:"
          style={{
            backgroundColor: "#D9D9D9",
            width: 290,
            height: 50,
            borderRadius: 20,
            marginTop: 15,
            paddingHorizontal: 20,
          }}
          onChangeText={(text) => setPassword(text)}
        ></TextInput>
        <TouchableOpacity>
          <Text
            style={{
              fontWeight: "700",
              fontSize: 16,
              marginTop: 10,
            }}
          >
            Forgot Password?
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={handleLogin}
          style={{
            height: 50,
            width: 250,
            backgroundColor: "#09A1F6",
            borderRadius: 10,
            marginTop: 10,

            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {/* Render login text or loading animation based on loading state */}
          {loading ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <Text
              style={{
                fontSize: 20,
                color: "#FFFFFF",
                fontWeight: "bold",
              }}
            >
              Login
            </Text>
          )}
        </TouchableOpacity>
        <TouchableOpacity onPress={handleSignup}>
          <Text
            style={{
              color: "#333333",
              marginTop: 15,
            }}
          >
            New to MentoRship?{" "}
            <Text style={{ fontWeight: "bold" }}>Signup Now</Text>
          </Text>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
