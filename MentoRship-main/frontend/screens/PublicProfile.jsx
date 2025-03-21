import { LinearGradient } from "expo-linear-gradient";
import React, { useState, useEffect, useContext } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  Platform,
  StatusBar,
  ScrollView,
  ActivityIndicator,
  Linking,
} from "react-native";
import { UserType } from "../UserContext";
import { MaterialIcons } from "@expo/vector-icons";
import RemoveFriendModal from "./RemoveFriendModal";

const PublicProfile = ({ route, navigation }) => {
  const { userId } = route.params;
  const { loggedInUserId } = useContext(UserType);
  const [userData, setUserData] = useState(null);
  const [friendshipStatus, setFriendshipStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [removeModalVisible, setRemoveModalVisible] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch(
          `https://mentorship-backends-rahul-mistrys-projects.vercel.app/public-profile/${userId}`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch user data");
        }
        const data = await response.json();
        setUserData(data);
        checkFriendshipStatus(data);
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchUserData();
  }, [userId]);

  const checkFriendshipStatus = async (userData) => {
    try {
      const response = await fetch(
        `https://mentorship-backends-rahul-mistrys-projects.vercel.app/check-friendship/${loggedInUserId}/${userId}`
      );
      if (!response.ok) {
        throw new Error("Failed to check friendship status");
      }
      const data = await response.json();
      setFriendshipStatus(data.status);
    } catch (error) {
      console.error("Error checking friendship status:", error);
    } finally {
      setLoading(false);
    }
  };

  const sendFriendRequest = async () => {
    try {
      const response = await fetch(
        "https://mentorship-backends-rahul-mistrys-projects.vercel.app/friend-request",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            currentUserId: loggedInUserId,
            selectedUserId: userId,
          }),
        }
      );
      if (!response.ok) {
        throw new Error("Failed to send friend request");
      }
      // Refresh friendship status after sending friend request
      checkFriendshipStatus(userData);
    } catch (error) {
      console.error("Error sending friend request:", error);
    }
  };

  const acceptFriendRequest = async () => {
    console.log("button clicked");
    try {
      const response = await fetch(
        "https://mentorship-backends-rahul-mistrys-projects.vercel.app/friend-request/accept",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            senderId: loggedInUserId,
            recepientId: userId,
          }),
        }
      );
      if (!response.ok) {
        throw new Error("Failed to accept friend request");
      }
      await response.json();
      // Refresh friendship status after accepting friend request
      checkFriendshipStatus(userData);
    } catch (error) {
      console.error("Error accepting friend request:", error);
    }
  };

  const removeFriend = async () => {
    try {
      const response = await fetch("https://mentorship-backends-rahul-mistrys-projects.vercel.app/remove-friend", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: loggedInUserId,
          friendId: userId,
        }),
      });
      if (!response.ok) {
        throw new Error("Failed to remove friend");
      }
      // Refresh friendship status after removing friend
      checkFriendshipStatus(userData);
      setRemoveModalVisible(false); // Close the modal
    } catch (error) {
      console.error("Error removing friend:", error);
    }
  };

  const openSocialMedia = (url) => {
    if (url) {
      Linking.openURL(url).catch((err) =>
        console.error("Error opening URL:", err)
      );
    }
  };

  const handleRemoveFriendModal = () => {
    if (friendshipStatus === "friends") {
      setRemoveModalVisible(true);
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
      <StatusBar barStyle="light-content" />
      <View style={{ flex: 1 }}>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            paddingHorizontal: 20,
            marginTop: Platform.OS === "ios" ? 55 : 45,
          }}
        >
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={{ marginRight: 15 }}
          >
            <MaterialIcons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text
            style={{
              fontSize: 25,
              fontWeight: "bold",
              color: "#FFFFFF",
            }}
          >
            Profile
          </Text>
        </View>

        <View
          style={{
            flex: 1,
            borderTopStartRadius: 50,
            borderTopEndRadius: 50,
            backgroundColor: "#FFFFFF",
            marginTop: 20,
            paddingHorizontal: 20,
            paddingTop: 20,
          }}
        >
          {loading ? (
            <View
              style={{
                flex: 1,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <ActivityIndicator size="large" color="#000" />
              <Text>Please wait...</Text>
            </View>
          ) : (
            <ScrollView showsVerticalScrollIndicator={false}>
              <Image
                source={{
                  uri: userData ? userData.image : "../assets/User.png",
                }}
                style={{
                  width: 100,
                  height: 100,
                  marginTop: 20,
                  alignSelf: "center",
                  borderRadius: 50,
                }}
              />
              <Text
                style={{
                  textAlign: "center",
                  fontSize: 20,
                  marginTop: 10,
                  fontWeight: "bold",
                }}
              >
                {userData ? userData.name : ""}
              </Text>
              <Text style={{ textAlign: "center" }}>
                {userData ? userData.headline : ""}
              </Text>
              <Text style={{ textAlign: "center" }}>
                {userData ? userData.bio : ""}
              </Text>

              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "center",
                  marginTop: 10,
                }}
              >
                <TouchableOpacity
                  style={{
                    width: 120,
                    height: 50,
                    borderRadius: 20,
                    padding: 5,
                    backgroundColor:
                      friendshipStatus === "friends"
                        ? "#0095d5"
                        : friendshipStatus === "request_sent"
                        ? "#D3D3D3"
                        : "#0095d5",
                    justifyContent: "center",
                    marginHorizontal: 10,
                  }}
                  onPress={() => {
                    if (friendshipStatus !== "friends") {
                      friendshipStatus === "request_sent"
                        ? null
                        : sendFriendRequest();
                    } else if (friendshipStatus === "accept_request") {
                      acceptFriendRequest();
                    } else if (friendshipStatus === "friends") {
                      handleRemoveFriendModal();
                    }
                  }}
                >
                  <Text
                    style={{
                      fontWeight: "bold",
                      textAlign: "center",
                      color:
                        friendshipStatus === "request_sent"
                          ? "#000000"
                          : "#ffffff",
                    }}
                  >
                    {friendshipStatus === "friends"
                      ? "Connected"
                      : friendshipStatus === "request_sent"
                      ? "Sent Request"
                      : friendshipStatus === "accept_request"
                      ? "Accept Request"
                      : "Connect"}
                  </Text>
                </TouchableOpacity>
                {friendshipStatus === "friends" && (
                  <TouchableOpacity
                    style={{
                      width: 120,
                      height: 50,
                      borderRadius: 20,
                      backgroundColor: "#0095d5",
                      justifyContent: "center",
                      marginHorizontal: 10,
                    }}
                    onPress={() => {
                      navigation.navigate("Messages", {
                        recepientId: userId,
                      });
                    }}
                  >
                    <Text
                      style={{
                        fontWeight: "bold",
                        textAlign: "center",
                        color: "#ffffff",
                      }}
                    >
                      Message
                    </Text>
                  </TouchableOpacity>
                )}
              </View>

              <Text style={{ fontWeight: "bold", fontSize: 20, marginTop: 20 }}>
                Skills and Expertise
              </Text>
              <Text style={{ fontWeight: "bold", fontSize: 20, marginTop: 20 }}>
                Interests and Goals
              </Text>
              {userData &&
                userData.careerGoals &&
                userData.careerGoals.length > 0 && (
                  <View>
                    <Text style={{ fontSize: 16, marginTop: 10 }}>
                      {userData.careerGoals.map((goal, index) => (
                        <Text key={index}>
                          {goal}
                          {index !== userData.careerGoals.length - 1
                            ? ", "
                            : ""}
                        </Text>
                      ))}
                    </Text>
                  </View>
                )}
              <Text style={{ fontWeight: "bold", fontSize: 20, marginTop: 20 }}>
                Experience and Education
              </Text>
              <View style={{ marginTop: 10 }}>
                <Text style={{ fontSize: 16, fontWeight: "bold" }}>
                  Education:
                </Text>
                <Text>{userData ? userData.education : ""}</Text>
              </View>
              <View style={{ marginTop: 10 }}>
                <Text style={{ fontSize: 16, fontWeight: "bold" }}>
                  Grade Year:
                </Text>
                <Text>{userData ? userData.gradeYear : ""}</Text>
              </View>
              <View style={{ marginTop: 10 }}>
                <Text style={{ fontSize: 16, fontWeight: "bold" }}>Major:</Text>
                <Text>{userData ? userData.major : ""}</Text>
              </View>
              <View style={{ marginTop: 10 }}>
                <Text style={{ fontSize: 16, fontWeight: "bold" }}>
                  Degree:
                </Text>
                <Text>{userData ? userData.degree : ""}</Text>
              </View>
              {/* <Text style={{ fontWeight: "bold", fontSize: 20, marginTop: 20 }}>
                Reviews
              </Text> */}
              <Text style={{ fontWeight: "bold", fontSize: 20, marginTop: 20 }}>
                Contact
              </Text>
              <View
                style={{
                  flexDirection: "row",
                  gap: 10,
                  alignItems: "flex-start",
                  marginTop: 20,
                }}
              >
                <TouchableOpacity
                  onPress={() => openSocialMedia(userData.socialMedia.linkedIn)}
                >
                  <Image
                    source={require("../assets/LinkedIn.png")}
                    style={{ height: 50, width: 50 }}
                  />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() =>
                    openSocialMedia(userData.socialMedia.instagram)
                  }
                >
                  <Image
                    source={require("../assets/instagram.png")}
                    style={{ height: 50, width: 50 }}
                  />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => openSocialMedia(userData.socialMedia.facebook)}
                >
                  <Image
                    source={require("../assets/fb.png")}
                    style={{ height: 50, width: 50 }}
                  />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => openSocialMedia(userData.socialMedia.twitter)}
                >
                  <Image
                    source={require("../assets/twitter.png")}
                    style={{ height: 50, width: 50 }}
                  />
                </TouchableOpacity>
              </View>
              <Text style={{ fontWeight: "bold", fontSize: 20, marginTop: 20 }}>
                Project
              </Text>
            </ScrollView>
          )}
        </View>
        <RemoveFriendModal
          visible={removeModalVisible}
          onClose={() => setRemoveModalVisible(false)}
          onRemove={removeFriend}
        />
      </View>
    </LinearGradient>
  );
};

export default PublicProfile;
