import React, { useState, useRef, useContext, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Alert,
  Image,
  ActivityIndicator,
  Keyboard,
  StatusBar,
} from "react-native";
import axios from "axios";
import { UserType } from "../UserContext";

export default function VerifyOTP({ navigation }) {
  const [otp, setOTP] = useState("");
  const [loading, setLoading] = useState(false);
  const [userName, setUserName] = useState("");
  const [userImage, setUserImage] = useState(null);
  const inputRefs = useRef([]);
  const { userId } = useContext(UserType);
  const [resendDisabled, setResendDisabled] = useState(true);
  const [cooldownTimer, setCooldownTimer] = useState(60);
  const [userDataLoading, setUserDataLoading] = useState(true);
  const [currentInputIndex, setCurrentInputIndex] = useState(-1);
  const [totalDigitsCount, setTotalDigitsCount] = useState(0);

  useEffect(() => {
    // Fetch user's name and image from the backend API
    const fetchUserData = async () => {
      try {
        const response = await axios.get(
          `https://mentorship-backends-rahul-mistrys-projects.vercel.app/${userId}/image`
        );
        setUserName(response.data.name);
        setUserImage(response.data.image);
        setUserDataLoading(false);
      } catch (error) {
        console.log("Error fetching user data:", error);
        setUserDataLoading(false);
      }
    };

    fetchUserData();

    if (resendDisabled) {
      const timer = setInterval(() => {
        setCooldownTimer((prevTimer) => {
          if (prevTimer === 0) {
            setResendDisabled(false);
            clearInterval(timer);
            return 60;
          } else {
            return prevTimer - 1;
          }
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [resendDisabled, userId]);

  useEffect(() => {
    calculateTotalDigitsCount();

    if (totalDigitsCount === 6) {
      handleVerifyOTP();
    }
  }, [otp, totalDigitsCount]);

  // Function to calculate total digits count
  const calculateTotalDigitsCount = () => {
    const count = otp.replace(/\D/g, "").length;
    setTotalDigitsCount(count);
  };

  useEffect(() => {
    calculateTotalDigitsCount();
  }, [otp]);

  const handleVerifyOTP = async () => {
    try {
      setLoading(true);
      const response = await axios.post(
        "https://mentorship-backends-rahul-mistrys-projects.vercel.app/verify-otp",
        {
          userId,
          otp,
        }
      );
      setLoading(false);

      if (response.status === 200) {
        // OTP is valid, check if user is onboarded
        const onboardedResponse = await axios.get(
          `https://mentorship-backends-rahul-mistrys-projects.vercel.app/user-onboarded/${userId}`
        );

        const onboarded = onboardedResponse.data.onboarded;
        if (onboarded) {
          // Reset navigation stack and navigate to Chat screen
          navigation.reset({
            index: 0,
            routes: [{ name: "Chat" }],
          });
        } else {
          // Reset navigation stack and navigate to Welcome screen
          navigation.reset({
            index: 0,
            routes: [{ name: "Welcome" }],
          });
        }
      } else {
        // Invalid OTP
        Alert.alert("Error", "Invalid OTP. Please try again.");
      }
    } catch (error) {
      setLoading(false);
      console.log("Error:", error);
      if (error.response && error.response.status === 400) {
        Alert.alert("Error", "Invalid OTP. Please try again.");
      } else {
        Alert.alert("Error", "An error occurred. Please try again later.");
      }
    }
  };

  const focusNextInput = (index) => {
    if (index < 5) {
      inputRefs.current[index + 1].focus();
    }
  };

  const focusPreviousInput = (index) => {
    if (index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handleTextInputChange = (text, index) => {
    const newOTP = [...otp];
    newOTP[index] = text;
    setOTP(newOTP.join(""));

    if (text.length === 0 && index > 0) {
      // Move to the previous input when deleting a character and then go ahead again
      focusPreviousInput(index);
    } else if (text.length === 1 && index < 5) {
      // Move to the next input when typing a character
      focusNextInput(index);
    }

    if (index === 5) {
      Keyboard.dismiss();
    }
    calculateTotalDigitsCount();
  };

  const handleResendOTP = async () => {
    try {
      // Disable resend button and start cooldown timer
      setResendDisabled(true);
    } catch (error) {
      console.log("Error in resending OTP:", error);
      Alert.alert("Error", "An error occurred. Please try again later.");
    }
  };

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: "#FFFFFF",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <View
        style={{
          flex: 1,
          width: "100%",
          alignItems: "center",
          justifyContent: "center",
          marginTop: 30,
        }}
      >
        <View style={{ alignItems: "center" }}>
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
              marginBottom: 5,
              color: "#000000",
            }}
          >
            MentoRship
          </Text>
          {userDataLoading ? (
            <ActivityIndicator color="#000000" size="small" />
          ) : (
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginTop: 60,
              }}
            >
              {userImage && (
                <Image
                  source={{ uri: userImage }}
                  style={{
                    height: 60,
                    width: 60,
                    borderRadius: 30,
                    marginRight: 10,
                  }}
                />
              )}
              <Text
                style={{ fontSize: 28, fontWeight: "bold", color: "#000000" }}
              >
                Hi, {userName}
              </Text>
            </View>
          )}
          <Text style={{ fontSize: 16, marginTop: 10, marginHorizontal: 20 }}>
            Please enter the OTP sent to your email.
          </Text>
        </View>
      </View>
      <View
        style={{
          flex: 1,
          width: "100%",
          paddingHorizontal: 20,
          paddingTop: 20,
          borderTopLeftRadius: 30,
          borderTopRightRadius: 30,
          backgroundColor: "#F8F8F8",
        }}
      >
        <View style={{ flexDirection: "row" }}>
          {/* OTP input fields */}
          {[...Array(6)].map((_, index) => (
            <TextInput
              key={index}
              ref={(ref) => (inputRefs.current[index] = ref)}
              style={{
                borderWidth: 1,
                borderColor: index === currentInputIndex ? "#000" : "#09A1F6",
                width: 50,
                height: 50,
                textAlign: "center",
                fontSize: 20,
                borderRadius: 10,
                marginRight: 10,
              }}
              keyboardType="numeric"
              maxLength={1}
              value={otp[index] || ""}
              onChangeText={(text) => handleTextInputChange(text, index)}
              onFocus={() => setCurrentInputIndex(index)}
              onSubmitEditing={() => {
                if (index === 5) {
                  handleVerifyOTP();
                }
              }}
              onKeyPress={({ nativeEvent }) => {
                if (nativeEvent.key === "Backspace" && index > 0) {
                  focusPreviousInput(index);
                }
              }}
              caretHidden={true}
            />
          ))}
        </View>

        {/* Verify OTP button */}
        <TouchableOpacity
          onPress={handleVerifyOTP}
          style={{
            backgroundColor: "#09A1F6",
            paddingVertical: 15,
            paddingHorizontal: 40,
            borderRadius: 10,
            marginTop: 20,
            alignItems: "center",
            justifyContent: "center",
          }}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <Text
              style={{ color: "#FFFFFF", fontSize: 18, fontWeight: "bold" }}
            >
              Verify OTP
            </Text>
          )}
        </TouchableOpacity>

        <View
          style={{
            marginTop: 20,
            flexDirection: "row",
            alignItems: "center",
            flexWrap: "wrap",
            justifyContent: "center",
          }}
        >
          <Text style={{ color: "#000", fontSize: 16 }}>
            Didn't receive the verification OTP?
          </Text>
          <TouchableOpacity onPress={handleResendOTP} disabled={resendDisabled}>
            <Text
              style={{
                color: resendDisabled ? "#ccc" : "#09A1F6",
                fontSize: 16,
                marginLeft: 5,
                fontWeight: resendDisabled ? "normal" : "bold",
              }}
            >
              {resendDisabled
                ? `Resend OTP in ${cooldownTimer}s`
                : "Resend Again"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
