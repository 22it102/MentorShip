import React, { useContext, useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  ActivityIndicator,
  StatusBar,
  TouchableOpacity,
  Platform,
  ScrollView,
} from "react-native";
import axios from "axios";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialIcons } from "@expo/vector-icons";
import MentorRequest from "../components/MentorRequest";
import { useNavigation } from "@react-navigation/native";
import { UserType } from "../UserContext";

const MentorRequestScreen = () => {
  const [loading, setLoading] = useState(true);
  const [friendRequests, setFriendRequests] = useState([]);
  const navigation = useNavigation();
  const { userId } = useContext(UserType);
  useEffect(() => {
    fetchFriendRequests();
  }, []);

  const fetchFriendRequests = async () => {
    try {
      const response = await axios.get(
        `https://mentorship-backends-rahul-mistrys-projects.vercel.app/friend-request/${userId}`
      );
      if (response.status === 200) {
        setLoading(false);
        setFriendRequests(response.data);
      }
    } catch (err) {
      console.log("error message", err);
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
      <View style={styles.header}>
        <TouchableOpacity onPress={navigateBack} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.title}>Notifications</Text>
      </View>
      <View style={styles.content}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#FFFFFF" />
            <Text style={styles.loadingText}>Please wait...</Text>
          </View>
        ) : (
          <View style={styles.requestsContainer}>
            <ScrollView>
              {friendRequests.length > 0 ? (
                friendRequests.map((item, index) => (
                  <MentorRequest
                    key={index}
                    item={item}
                    friendRequests={friendRequests}
                    setFriendRequests={setFriendRequests}
                  />
                ))
              ) : (
                <Text style={styles.noRequestsText}>No Notifications</Text>
              )}
            </ScrollView>
          </View>
        )}
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    marginTop: Platform.OS === "ios" ? 55 : 45,
  },
  backButton: {
    marginRight: 15,
  },
  title: {
    fontSize: 25,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  content: {
    flex: 1,
    borderTopStartRadius: 50,
    borderTopEndRadius: 50,
    backgroundColor: "#FFFFFF",
    marginTop: 20,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#FFFFFF",
  },
  requestsContainer: {
    flex: 1,
  },
  noRequestsText: {
    fontSize: 16,
    textAlign: "center",
    color: "gray",
  },
});

export default MentorRequestScreen;
