import React, { useContext, useEffect, useState } from "react";
import {
  View,
  Text,
  Pressable,
  Image,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { UserType } from "../UserContext";
import { useNavigation } from "@react-navigation/native";
import axios from "axios";

const User = ({ item, category }) => {
  const { userId } = useContext(UserType);
  const navigation = useNavigation();
  const [friendStatus, setFriendStatus] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (category === "All Members") {
      fetchFriendStatus();
    }
  }, []);

  const fetchFriendStatus = async () => {
    setLoading(true);
    try {
      const friendRequestsResponse = await axios.get(
        `https://mentorship-backends-rahul-mistrys-projects.vercel.app/friend-request/${userId}`
      );
      const acceptedFriendsResponse = await axios.get(
        `https://mentorship-backends-rahul-mistrys-projects.vercel.app/accepted-friends/${userId}`
      );

      const friendRequests = friendRequestsResponse.data.map(
        (friendRequest) => friendRequest._id
      );
      const acceptedFriends = acceptedFriendsResponse.data.map(
        (acceptedFriend) => acceptedFriend._id
      );

      if (acceptedFriends.includes(item._id)) {
        setFriendStatus("Connected");
      } else if (friendRequests.includes(item._id)) {
        setFriendStatus("Request Sent");
      } else {
        setFriendStatus(null);
      }
    } catch (error) {
      console.log("Error fetching friend status:", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePressMessage = () => {
    navigation.navigate("Messages", { recepientId: item._id });
  };

  const renderStatusMessage = () => {
    if (category === "All Members" && friendStatus) {
      switch (friendStatus) {
        case "Connected":
          return <Text style={styles.statusText}>Connected</Text>;
        case "Request Sent":
          return <Text style={styles.statusText}>Request Sent</Text>;
        default:
          return null;
      }
    }
    return null;
  };

  const renderActionButton = () => {
    if (loading) {
      return (
        <ActivityIndicator
          size="small"
          color="#000"
          style={{
            marginHorizontal: 40,
          }}
        />
      );
    }
    if (category === "Connections") {
      return (
        <Pressable onPress={handlePressMessage} style={styles.actionButton}>
          <Text style={styles.actionButtonText}>Message</Text>
        </Pressable>
      );
    } else if (category === "Request Sent") {
      return (
        <Pressable
          style={[styles.actionButton, { backgroundColor: "gray" }]}
          disabled={true}
        >
          <Text style={styles.actionButtonText}>Request Sent</Text>
        </Pressable>
      );
    } else if (category === "All Members" && friendStatus === "Connected") {
      return (
        <Pressable onPress={handlePressMessage} style={styles.actionButton}>
          <Text style={styles.actionButtonText}>Message</Text>
        </Pressable>
      );
    } else if (category === "All Members" && friendStatus === "Request Sent") {
      return (
        <Pressable
          style={[styles.actionButton, { backgroundColor: "gray" }]}
          disabled={true}
        >
          <Text style={styles.actionButtonText}>Request Sent</Text>
        </Pressable>
      );
    } else if (category === "All Members" && !friendStatus) {
      return (
        <Pressable
          style={[styles.actionButton, { backgroundColor: "#007CB0" }]}
          onPress={sendFriendRequest}
        >
          <Text style={styles.actionButtonText}>Connect</Text>
        </Pressable>
      );
    }
    return null;
  };

  const sendFriendRequest = async () => {
    try {
      await axios.post("https://mentorship-backends-rahul-mistrys-projects.vercel.app/friend-request", {
        currentUserId: userId,
        selectedUserId: item._id,
      });
      setFriendStatus("Request Sent");
    } catch (error) {
      console.log("Error sending friend request:", error);
    }
  };

  return (
    <Pressable style={styles.container}>
      <View>
        <Image style={styles.avatar} source={{ uri: item?.image }} />
      </View>
      <View style={styles.userInfo}>
        <Text style={styles.userName}>{item?.name}</Text>
        {renderStatusMessage()}
      </View>
      {renderActionButton()}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 10,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    resizeMode: "cover",
  },
  userInfo: {
    marginLeft: 12,
    flex: 1,
  },
  userName: {
    fontWeight: "bold",
  },
  statusText: {
    color: "#666",
  },
  actionButton: {
    backgroundColor: "#09A1F6",
    padding: 10,
    borderRadius: 6,
    width: 105,
  },
  actionButtonText: {
    textAlign: "center",
    color: "white",
    fontSize: 13,
  },
});

export default User;
