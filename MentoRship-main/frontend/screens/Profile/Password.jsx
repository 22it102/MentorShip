import React, { useContext, useState, useEffect } from "react";
import {
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  StyleSheet,
  Modal,
  TextInput,
  TouchableWithoutFeedback,
  ActivityIndicator,
  BackHandler,
  StatusBar,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Icon from "react-native-vector-icons/FontAwesome5";
import { UserType } from "../../UserContext";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { MaterialIcons } from "@expo/vector-icons";

export default function Password({ navigation }) {
  const [modalVisible, setModalVisible] = useState(false);
  const [userName, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { userId } = useContext(UserType);
  const [showNotification, setShowNotification] = useState(false);
  const [error, setError] = useState(null); // State for error message
  const [isFocused, setIsFocused] = useState(false); // State to track focus state

  useEffect(() => {
    if (modalVisible) {
      fetchUserName();
    }
  }, [modalVisible]);

  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      () => {
        if (modalVisible) {
          setModalVisible(false);
          return true;
        }
        return false;
      }
    );

    return () => backHandler.remove();
  }, [modalVisible]);

  const fetchUserName = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `https://mentorship-backends-rahul-mistrys-projects.vercel.app/user-details/${userId}`
      );
      setUserName(response.data.FirstName);
    } catch (error) {
      console.error("Error fetching user details: ", error);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmClose = async () => {
    try {
      if (!password) {
        setError("Please enter your password.");
        return;
      }

      setLoading(true);
      const response = await axios.delete(
        `https://mentorship-backends-rahul-mistrys-projects.vercel.app/delete-account/${userId}`,
        {
          data: { password },
        }
      );
      console.log("Account deleted successfully:", response.data);

      setShowNotification(true);
      setModalVisible(false);

      await AsyncStorage.clear();

      setTimeout(() => {
        navigation.reset({
          index: 0,
          routes: [{ name: "Onboarding" }],
        });
      }, 1500);
    } catch (error) {
      setError("Incorrect password. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  const navigateBack = () => {
    navigation.goBack();
  };

  return (
    <LinearGradient
      colors={["#000000", "#007CB0"]}
      style={{ flex: 1 }}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
      locations={[0.3, 1]}
    >
      <StatusBar barStyle="white-content" />
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          paddingHorizontal: 20,
          marginTop: 45,
        }}
      >
        <TouchableOpacity onPress={navigateBack} style={{ marginRight: 15 }}>
          <MaterialIcons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text
          style={{
            fontSize: 25,
            fontWeight: "bold",
            color: "#FFFFFF",
          }}
        >
          Account Settings
        </Text>
      </View>
      <View style={styles.friendsContainer}>
        <TouchableOpacity onPress={() => navigation.navigate("ChangePassword")}>
          <View style={styles.item}>
            <Icon name="lock" size={20} color="#000" />
            <Text style={styles.itemText}>Change Password</Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setModalVisible(true)}>
          <View style={styles.item}>
            <Text style={[styles.itemText, { color: "#FF0000" }]}>
              Close Account
            </Text>
          </View>
        </TouchableOpacity>
      </View>
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Close Account</Text>
              {loading ? (
                <ActivityIndicator size="large" color="#000" />
              ) : (
                <>
                  <Text style={styles.modalText}>
                    {userName
                      ? `${userName}, We are sorry to see you go.`
                      : "Loading..."}
                  </Text>
                  <TextInput
                    style={[
                      styles.input,
                      { borderColor: isFocused ? "#09A1F6" : "#CCCCCC" }, // Change border color based on focus state
                    ]}
                    placeholder="Confirm Your Password"
                    secureTextEntry={true}
                    value={password}
                    onChangeText={setPassword}
                    onFocus={() => setIsFocused(true)} // Set focus state to true
                    onBlur={() => setIsFocused(false)} // Set focus state to false
                  />
                  {error && <Text style={styles.errorText}>{error}</Text>}
                  {/* Render error text */}
                  <Text style={[styles.modalText, { marginBottom: 20 }]}>
                    If you have any questions, please visit our
                    <Text style={{ color: "#09A1F6" }}> Help Center</Text>.
                  </Text>
                  <TouchableOpacity
                    style={styles.redButton}
                    onPress={handleConfirmClose}
                  >
                    <Text style={styles.redButtonText}>Close Account</Text>
                  </TouchableOpacity>
                </>
              )}
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
      {showNotification && (
        <View style={styles.notificationContainer}>
          <Text style={styles.notificationText}>
            Account deactivated successfully!
          </Text>
        </View>
      )}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  title: {
    fontSize: 25,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginTop: 45,
    textAlign: "left",
    marginLeft: 20,
  },
  friendsContainer: {
    flex: 1,
    borderTopStartRadius: 50,
    borderTopEndRadius: 50,
    backgroundColor: "#FFFFFF",
    marginTop: 20,
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 20,
    marginHorizontal: 20,
    gap: 10,
  },
  itemText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#000",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    padding: 20,
    borderRadius: 20,
    width: "80%",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
  },
  modalText: {
    fontSize: 16,
    marginBottom: 10,
  },
  input: {
    height: 40,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 10,
    marginBottom: 15,
  },
  redButton: {
    backgroundColor: "#FF0000",
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: "center",
    marginBottom: 10,
  },
  redButtonText: {
    fontSize: 18,
    color: "#FFFFFF",
  },
  notificationContainer: {
    position: "absolute",
    bottom: 20,
    alignSelf: "center",
    backgroundColor: "#4CAF50",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
    elevation: 5,
  },
  notificationText: {
    fontSize: 16,
    color: "#FFFFFF",
    fontWeight: "bold",
  },
  errorText: {
    color: "red",
    marginBottom: 10,
  },
});
