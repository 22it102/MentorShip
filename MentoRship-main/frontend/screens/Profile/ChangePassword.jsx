import React, { useContext, useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  SafeAreaView,
  TouchableOpacity,
  StyleSheet,
  Keyboard,
  ActivityIndicator,
  Platform,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { UserType } from "../../UserContext";
import axios from "axios"; // Import axios for making HTTP requests
import { Ionicons } from "@expo/vector-icons";

export default function ChangePassword({ navigation }) {
  const { userId } = useContext(UserType);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [toastVisible, setToastVisible] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [oldPasswordFocused, setOldPasswordFocused] = useState(false);
  const [newPasswordFocused, setNewPasswordFocused] = useState(false);
  const [confirmPasswordFocused, setConfirmPasswordFocused] = useState(false);

  useEffect(() => {
    if (toastVisible) {
      setTimeout(() => {
        setToastVisible(false);
      }, 3000);
    }
  }, [toastVisible]);

  const handleChangePassword = async () => {
    Keyboard.dismiss();
    if (!oldPassword || !newPassword || !confirmPassword) {
      setError("Please fill in all fields");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      setLoading(true);
      const response = await axios.post(
        `https://mentorship-backends-rahul-mistrys-projects.vercel.app/change-password/${userId}`,
        {
          oldPassword,
          newPassword,
        }
      );

      // If the password change was successful
      // Display a toast notification
      setToastVisible(true);

      // Clear the input fields
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setError(null);
    } catch (error) {
      setError("Incorrect old password. Please try again."); // Set error message for incorrect old password
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient
      colors={["#000000", "#007CB0"]}
      style={{ flex: 1 }}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
      locations={[0.3, 1]}
    >
      <SafeAreaView
        style={{
          flex: 1,
          paddingBottom: 0,
        }}
      >
        <Text
          style={{
            fontSize: 25,
            fontWeight: "bold",
            color: "#FFFFFF",
            marginTop: Platform.OS === "ios" ? 10 : 45,
            textAlign: "left",
            marginLeft: 20,
          }}
        >
          Change Password
        </Text>
        <View style={styles.friendsContainer}>
          <Text style={styles.label}>Enter Old Password</Text>
          <TextInput
            style={[
              styles.input,
              { borderColor: oldPasswordFocused ? "#09A1F6" : "#D9D9D9" },
            ]}
            secureTextEntry={true}
            placeholder="Old Password"
            value={oldPassword}
            onChangeText={(text) => setOldPassword(text)}
            onFocus={() => setOldPasswordFocused(true)}
            onBlur={() => setOldPasswordFocused(false)}
          />
          <Text style={styles.label}>Create New Password</Text>
          <TextInput
            style={[
              styles.input,
              { borderColor: newPasswordFocused ? "#09A1F6" : "#D9D9D9" },
            ]}
            secureTextEntry={true}
            placeholder="New Password"
            value={newPassword}
            onChangeText={(text) => setNewPassword(text)}
            onFocus={() => setNewPasswordFocused(true)}
            onBlur={() => setNewPasswordFocused(false)}
          />
          <Text style={styles.label}>Confirm New Password</Text>
          <TextInput
            style={[
              styles.input,
              { borderColor: confirmPasswordFocused ? "#09A1F6" : "#D9D9D9" },
            ]}
            secureTextEntry={true}
            placeholder="Confirm New Password"
            value={confirmPassword}
            onChangeText={(text) => setConfirmPassword(text)}
            onFocus={() => setConfirmPasswordFocused(true)}
            onBlur={() => setConfirmPasswordFocused(false)}
          />
          {error && <Text style={styles.errorText}>{error}</Text>}
          <TouchableOpacity
            style={styles.button}
            onPress={handleChangePassword}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text style={styles.buttonText}>Change Password</Text>
            )}
          </TouchableOpacity>
        </View>
      </SafeAreaView>
      {toastVisible && (
        <View style={styles.toastContainer}>
          <Text style={styles.toastText}>Password changed successfully!</Text>
        </View>
      )}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    marginTop: 50,
  },
  title: {
    fontSize: 25,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginLeft: 10,
  },
  friendsContainer: {
    flex: 1,
    borderTopStartRadius: 50,
    borderTopEndRadius: 50,
    backgroundColor: "#FFFFFF",
    marginTop: 20,
    paddingHorizontal: 20,
    paddingTop: 30,
    marginBottom: -50,
  },
  label: {
    fontWeight: "bold",
    fontSize: 16,
    marginBottom: 8,
    marginLeft: 10,
  },
  input: {
    backgroundColor: "#FFFFFF",
    height: 50,
    borderRadius: 20,
    marginBottom: 20,
    paddingHorizontal: 20,
    borderColor: "#D9D9D9",
    borderWidth: 1,
    width: "100%",
    alignSelf: "center",
  },
  button: {
    backgroundColor: "#09A1F6",
    height: 50,
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
    width: "70%",
    alignSelf: "center",
    marginTop: 20,
  },
  buttonText: {
    color: "#ffffff",
    fontWeight: "500",
    fontSize: 18,
  },
  toastContainer: {
    backgroundColor: "#4CAF50", // Green color
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    position: "absolute",
    bottom: 50,
    alignSelf: "center",
  },
  toastText: {
    color: "#ffffff",
  },
  errorText: {
    color: "red",
    marginBottom: 10,
    marginLeft: 10,
  },
});
