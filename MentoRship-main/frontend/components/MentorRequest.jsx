import React, { useContext } from "react";
import { Pressable, View, Image, Text, StyleSheet } from "react-native";
import { UserType } from "../UserContext";
import axios from "axios";
import { MaterialIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

const MentorRequest = ({ item, friendRequests, setFriendRequests }) => {
  const { userId } = useContext(UserType);
  const navigation = useNavigation();

  const handleIgnoreRequest = async (friendRequestId) => {
    try {
      const response = await axios.post(
        "https://mentorship-backends-rahul-mistrys-projects.vercel.app/reject-friend-request",
        {
          userId: userId,
          senderId: friendRequestId,
        }
      );
      if (response.status === 200) {
        setFriendRequests(
          friendRequests.filter((request) => request._id !== friendRequestId)
        );
      }
    } catch (err) {
      console.log("error ignoring the friend request", err);
    }
  };

  const handleAcceptRequest = async (friendRequestId) => {
    try {
      const response = await axios.post(
        "https://mentorship-backends-rahul-mistrys-projects.vercel.app/friend-request/accept",
        {
          senderId: friendRequestId,
          recepientId: userId,
        }
      );
      if (response.status === 200) {
        setFriendRequests(
          friendRequests.filter((request) => request._id !== friendRequestId)
        );
        // Navigate to the chat screen or any other screen as needed
      }
    } catch (err) {
      console.log("error accepting the friend request", err);
    }
  };

  const handleNavigateToProfile = () => {
    navigation.navigate("PublicProfile", { userId: item._id });
  };

  return (
    <View style={styles.container}>
      <View style={styles.userInfo}>
        <Pressable onPress={handleNavigateToProfile}>
          <Image style={styles.userImage} source={{ uri: item.image }} />
        </Pressable>
        <View style={{ flexWrap: "wrap", flex: 1 }}>
          <Text style={styles.userName}>
            {item.name} sent{"\n"}a connection request!!
          </Text>
        </View>
      </View>
      <Pressable
        onPress={() => handleAcceptRequest(item._id)}
        style={[styles.button, styles.acceptButton]}
      >
        <MaterialIcons name="check" size={24} color="white" />
      </Pressable>
      <Pressable
        onPress={() => handleIgnoreRequest(item._id)}
        style={[styles.button, styles.ignoreButton]}
      >
        <MaterialIcons name="close" size={24} color="white" />
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginVertical: 10,
    paddingHorizontal: 10,
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  userImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 10,
  },
  userName: {
    fontSize: 15,
    fontWeight: "600",
  },
  button: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  acceptButton: {
    backgroundColor: "#0095f6",
    marginRight: 10,
  },
  ignoreButton: {
    backgroundColor: "#ff2f41",
  },
});

export default MentorRequest;
