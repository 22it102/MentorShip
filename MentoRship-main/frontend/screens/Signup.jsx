import React, { useState, useContext } from "react";
import {
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
  ScrollView,
  Modal,
} from "react-native";
import { Image } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from "expo-image-picker";
import jwt_decode from "jwt-decode";
import { UserType } from "../UserContext";
import FlashMessage, { showMessage } from "react-native-flash-message";
import { FontAwesome, MaterialCommunityIcons } from "@expo/vector-icons";
import axios from "axios";

export default function Signup({ navigation }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [profileImage, setProfileImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const { setUserId } = useContext(UserType);
  const [nameBorderColor, setNameBorderColor] = useState("#D9D9D9");
  const [emailBorderColor, setEmailBorderColor] = useState("#D9D9D9");
  const [passwordBorderColor, setPasswordBorderColor] = useState("#D9D9D9");

  const openImageLibrary = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    console.log("Permission status:", status);

    if (status !== "granted") {
      alert("Sorry, we need camera roll permissions to make this work!");
      return;
    }

    const response = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
    });

    console.log("Response:", response);

    if (!response.cancelled && response.assets && response.assets.length > 0) {
      const { uri } = response.assets[0];
      console.log("Selected Image URI:", uri);
      setProfileImage(uri);
      console.log("Profile Image State:", profileImage);
    } else {
      console.log("No image selected");
    }
  };
  const handleSignup = async () => {
    if (!name || !email || !password || !profileImage) {
      Alert.alert(
        "Validation Error",
        "Please fill in all fields and upload an image."
      );
      return;
    }
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("email", email);
      formData.append("password", password);
      formData.append("image", {
        name: new Date().toISOString() + "_profile.jpg",
        type: "image/jpg",
        uri: profileImage,
      });

      const response = await axios.post(
        "https://mentorship-backends-rahul-mistrys-projects.vercel.app/register",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      const responseData = response.data;
      const token = responseData.token;
      AsyncStorage.setItem("authToken", token);
      const decodedToken = jwt_decode(token);
      const userId = decodedToken.userId;
      setUserId(userId);

      showMessage({
        message: "Success",
        description: "User registered successfully!",
        type: "success",
        duration: 1000,
        autoHide: true,
      });
      setTimeout(() => {
        navigation.navigate("VerifyOTP");
      }, 1000);
    } catch (error) {
      console.error("Signup failed:", error);
      Alert.alert("Signup Failed", "An error occurred during signup.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView
      style={{
        flex: 1,
        alignItems: "center",
        marginTop: 0,
      }}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "position" : "height"}
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Image
            source={require("../assets/Logo.png")}
            style={{
              height: 100,
              width: 100,
              marginBottom: 0,
              marginTop: 5,
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
            Welcome to MentoRship
          </Text>
          <Text
            style={{
              fontSize: 15,
              marginTop: 10,
              marginBottom: 20,
              textAlign: "center",
              paddingHorizontal: 50,
            }}
          >
            Join the MentoRship Community with one of these services
          </Text>
          <View
            style={{
              flexDirection: "row",
              gap: 10,
              marginTop: -15,
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
            Signup With Email
          </Text>
          <View
            style={{
              marginTop: 5,
              marginBottom: 5,
            }}
          >
            <TouchableOpacity onPress={openImageLibrary}>
              <View style={{ alignItems: "center" }}>
                <View
                  style={{
                    width: 80,
                    height: 80,
                    borderRadius: 50,
                    backgroundColor: profileImage ? "transparent" : "lightgray",
                    justifyContent: "center",
                    alignItems: "center",
                    marginTop: -2,
                  }}
                >
                  {profileImage ? (
                    <Image
                      source={{ uri: profileImage }}
                      style={{ width: 80, height: 80, borderRadius: 50 }}
                    />
                  ) : (
                    <MaterialCommunityIcons
                      name="camera"
                      size={45}
                      color="#000"
                    />
                  )}
                </View>
              </View>
            </TouchableOpacity>
          </View>

          <TextInput
            onChangeText={(text) => setName(text)}
            placeholder="Name"
            style={{
              backgroundColor: "#D9D9D9",
              width: 290,
              height: 50,
              borderRadius: 20,
              marginTop: 5,
              paddingHorizontal: 20,
              borderColor: nameBorderColor,
              borderWidth: 1,
            }}
            onFocus={() => setNameBorderColor("#09A1F6")}
            onBlur={() => setNameBorderColor("#D9D9D9")}
          />

          <TextInput
            onChangeText={(text) => setEmail(text)}
            placeholder="Email"
            style={{
              backgroundColor: "#D9D9D9",
              width: 290,
              height: 50,
              borderRadius: 20,
              marginTop: 15,
              paddingHorizontal: 20,
              borderColor: emailBorderColor,
              borderWidth: 1,
            }}
            onFocus={() => setEmailBorderColor("#09A1F6")}
            onBlur={() => setEmailBorderColor("#D9D9D9")}
          />

          <TextInput
            onChangeText={(text) => setPassword(text)}
            placeholder="Password"
            secureTextEntry
            style={{
              backgroundColor: "#D9D9D9",
              width: 290,
              height: 50,
              borderRadius: 20,
              marginTop: 15,
              paddingHorizontal: 20,
              borderColor: passwordBorderColor,
              borderWidth: 1,
            }}
            onFocus={() => setPasswordBorderColor("#09A1F6")}
            onBlur={() => setPasswordBorderColor("#D9D9D9")}
          />
          <TouchableOpacity
            onPress={handleSignup}
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
                Create Account
              </Text>
            )}
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate("Login")}>
            <Text
              style={{
                color: "#333333",
                marginTop: 5,
              }}
            >
              Already have an account?{" "}
              <Text style={{ fontWeight: "bold" }}>Login Now</Text>
            </Text>
          </TouchableOpacity>
          <FlashMessage position="bottom" />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
