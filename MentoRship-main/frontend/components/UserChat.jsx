import React, { useContext, useEffect, useState } from "react";
import { useNavigation } from "@react-navigation/native";
import { Pressable, Image, Text, View, StyleSheet } from "react-native";
import { UserType } from "../UserContext";

const UserChat = ({ item }) => {
  const { userId } = useContext(UserType);
  const navigation = useNavigation();
  const [lastMessage, setLastMessage] = useState(null);
  const [newMessagesCount, setNewMessagesCount] = useState(0);

  const fetchMessages = async () => {
    try {
      const response = await fetch(
        `https://mentorship-backends-rahul-mistrys-projects.vercel.app/messages/${userId}/${item._id}`
      );
      const data = await response.json();

      if (response.ok) {
        const userMessages = data.filter(
          (message) =>
            message.messageType === "text" &&
            message.senderId !== userId &&
            message.recepientId === userId
        );

        if (userMessages.length > 0) {
          const lastMessageItem = userMessages[userMessages.length - 1];
          const firstLine = lastMessageItem.message.split("\n")[0];
          lastMessageItem.message = firstLine;
          setLastMessage(lastMessageItem);
          const unreadMessagesCount = userMessages.filter(
            (message) => !message.read
          ).length;
          setNewMessagesCount(unreadMessagesCount);
        } else {
          setLastMessage(null);
          setNewMessagesCount(0);
        }
      } else {
        console.log("Error fetching messages:", response.status.message);
      }
    } catch (error) {
      console.log("Error fetching messages:", error);
    }
  };

  useEffect(() => {
    fetchMessages();
    const intervalId = setInterval(fetchMessages, 10000);
    return () => clearInterval(intervalId);
  }, []);

  const formatTime = (time) => {
    const options = { hour: "numeric", minute: "numeric" };
    return new Date(time).toLocaleString("en-US", options);
  };

  return (
    <Pressable
      onPress={() =>
        navigation.navigate("Messages", {
          recepientId: item._id,
        })
      }
      style={styles.container}
    >
      <Image style={styles.userImage} source={{ uri: item?.image }} />

      <View style={styles.detailsContainer}>
        <Text style={styles.userName}>{item?.name}</Text>
        {lastMessage && (
          <Text style={styles.lastMessage}>{lastMessage?.message}</Text>
        )}
      </View>

      <View style={styles.timeContainer}>
        <Text style={styles.time}>
          {lastMessage && formatTime(lastMessage?.timeStamp)}
        </Text>
        {newMessagesCount > 0 && (
          <View style={styles.newMessagesBadge}>
            <Text style={styles.newMessagesCount}>{newMessagesCount}</Text>
          </View>
        )}
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 0.7,
    borderColor: "#D0D0D0",
    borderTopWidth: 0,
    borderLeftWidth: 0,
    borderRightWidth: 0,
    padding: 10,
    marginHorizontal: 10,
  },
  userImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    resizeMode: "cover",
    marginRight: 10,
  },
  detailsContainer: {
    flex: 1,
    marginRight: 10,
  },
  userName: {
    fontSize: 15,
    fontWeight: "500",
  },
  lastMessage: {
    marginTop: 3,
    color: "gray",
    fontWeight: "500",
  },
  timeContainer: {
    justifyContent: "center",
    alignItems: "flex-end",
  },
  time: {
    fontSize: 11,
    fontWeight: "400",
    color: "#585858",
  },
  newMessagesBadge: {
    backgroundColor: "#0095f6",
    borderRadius: 50,
    width: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 5,
  },
  newMessagesCount: {
    color: "white",
    fontSize: 10,
  },
});

export default UserChat;
