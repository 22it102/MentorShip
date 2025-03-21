import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  KeyboardAvoidingView,
  TextInput,
  Pressable,
  Image,
  ActivityIndicator,
  StatusBar,
  TouchableOpacity,
  Platform,
} from "react-native";
import React, {
  useState,
  useContext,
  useLayoutEffect,
  useEffect,
  useRef,
} from "react";
import { Feather } from "@expo/vector-icons";
import { Ionicons } from "@expo/vector-icons";
import { FontAwesome } from "@expo/vector-icons";
import { MaterialIcons } from "@expo/vector-icons";
import { Entypo } from "@expo/vector-icons";
import EmojiSelector from "react-native-emoji-selector";
import { UserType } from "../UserContext";
import { useNavigation, useRoute } from "@react-navigation/native";
import * as ImagePicker from "expo-image-picker";
import { MaterialCommunityIcons } from "@expo/vector-icons";

const ChatMessagesScreen = () => {
  const [showEmojiSelector, setShowEmojiSelector] = useState(false);
  const [selectedMessages, setSelectedMessages] = useState([]);
  const [messages, setMessages] = useState([]);
  const [recepientData, setRecepientData] = useState();
  const navigation = useNavigation();
  const [selectedImage, setSelectedImage] = useState("");
  const route = useRoute();
  const { recepientId } = route.params;
  const [message, setMessage] = useState("");
  const { userId, setUserId } = useContext(UserType);
  const [loading, setLoading] = useState(true);
  const [lastSeen, setLastSeen] = useState(null);
  const [myText, setMyText] = useState("I'm ready to get swiped!");
  useEffect(() => {
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  }, []);

  const scrollViewRef = useRef(null);

  useEffect(() => {
    scrollToBottom();
  }, []);

  const scrollToBottom = () => {
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollToEnd({ animated: false });
    }
  };

  const handleContentSizeChange = () => {
    scrollToBottom();
  };
  const handleEmojiPress = () => {
    setShowEmojiSelector(!showEmojiSelector);
  };

  const fetchMessages = async () => {
    try {
      const response = await fetch(
        `https://mentorship-backends-rahul-mistrys-projects.vercel.app/messages/${userId}/${recepientId}`
      );
      const data = await response.json();

      if (response.ok) {
        setMessages(data);
      } else {
        console.log("error showing messages", response.status.message);
      }
    } catch (error) {
      console.log("error fetching messages", error);
    }
  };

  // TODO: Remove Comments
  useEffect(() => {
    const interval = setInterval(fetchMessages, 1000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const fetchRecepientData = async () => {
      try {
        const response = await fetch(
          `https://mentorship-backends-rahul-mistrys-projects.vercel.app/user/${recepientId}`
        );

        const data = await response.json();
        setRecepientData(data);
      } catch (error) {
        console.log("error retrieving details", error);
      }
    };

    fetchRecepientData();
  }, []);

  useEffect(() => {
    if (userId && messages.length > 0) {
      const unreadMessageIds = messages
        .filter((message) => !message.read && message.recepientId === userId)
        .map((message) => message._id);

      if (unreadMessageIds.length > 0) {
        markMessagesAsRead(unreadMessageIds);
      }
    }
  }, [userId, messages]);

  // Function to mark messages as read
  const markMessagesAsRead = async (messageIds) => {
    try {
      // Call API to mark messages as read
      await Promise.all(
        messageIds.map(async (messageId) => {
          const response = await fetch(
            `https://mentorship-backends-rahul-mistrys-projects.vercel.app/messages/read/${messageId}`,
            {
              method: "PUT",
            }
          );
          if (!response.ok) {
            console.log("error marking message as read:", response.status);
          }
        })
      );
    } catch (error) {
      console.log("error marking messages as read", error);
    }
  };
  // Update the fetchLastSeen function to calculate the time difference
  const fetchLastSeen = async () => {
    try {
      const response = await fetch(
        `https://mentorship-backends-rahul-mistrys-projects.vercel.app/user/last-seen/${recepientId}`
      );

      // Update sender's last seen time
      await fetch(`https://mentorship-backends-rahul-mistrys-projects.vercel.app/user/last-seen/${userId}`, {
        method: "PUT",
      });

      const data = await response.json();
      const lastSeenTime = data.lastSeen;

      if (lastSeenTime) {
        const lastSeenDate = new Date(lastSeenTime);

        // Calculate the time difference
        const currentTime = new Date();
        const timeDifference = currentTime.getTime() - lastSeenDate.getTime();

        // Convert milliseconds to minutes, hours, or days
        const minutes = Math.floor(timeDifference / (1000 * 60));
        const hours = Math.floor(timeDifference / (1000 * 60 * 60));
        const days = Math.floor(timeDifference / (1000 * 60 * 60 * 24));

        let lastSeen;
        if (minutes === 0) {
          lastSeen = "Online";
        } else if (days > 0) {
          lastSeen = `${days} days ago`;
        } else if (hours > 0) {
          lastSeen = `${hours} hours ago`;
        } else {
          lastSeen = `${minutes} minutes ago`;
        }

        setLastSeen(lastSeen);
      } else {
        setLastSeen("Unknown");
      }
    } catch (error) {
      console.log("error fetching last seen time", error);
    }
  };

  // useEffect to fetch messages when component mounts
  useEffect(() => {
    fetchMessages();
    fetchLastSeen();
  }, []);

  useEffect(() => {
    fetchMessages();
  }, [recepientId]);

  // Function to render message status indicators
  const renderMessageStatus = (message) => {
    const isCurrentUser = message?.senderId?._id === userId; // Check if the message sender is the current user

    if (message.sent && message.read) {
      // If message is sent and read
      return isCurrentUser ? (
        <MaterialCommunityIcons name="check-all" size={16} color="#FFFFFF" />
      ) : (
        <MaterialCommunityIcons name="check-all" size={16} color="blue" />
      );
    } else if (message.sent && !message.read) {
      // If message is sent but not read
      return isCurrentUser ? (
        <MaterialCommunityIcons name="check" size={16} color="#FFFFFF" />
      ) : (
        <MaterialCommunityIcons name="check" size={16} color="gray" />
      );
    } else {
      // If message is not sent
      return null;
    }
  };

  // Handle Send Button
  const handleSend = async (messageType, imageUri) => {
    try {
      // Check if the message is empty
      if (!message.trim()) {
        console.log("Message cannot be empty.");
        return; // Do not send the message if it's empty
      }

      const formData = new FormData();
      formData.append("senderId", userId);
      formData.append("recepientId", recepientId);

      // If the message type is image or a normal text
      if (messageType === "image") {
        formData.append("messageType", "image");
        formData.append("imageFile", {
          uri: imageUri,
          name: "image.jpg",
          type: "image/jpeg",
        });
      } else {
        formData.append("messageType", "text");
        formData.append("messageText", message);
      }

      const response = await fetch("https://mentorship-backends-rahul-mistrys-projects.vercel.app/messages", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        setMessage("");
        setSelectedImage("");

        fetchMessages();
      }
    } catch (error) {
      console.log("error in sending the message", error);
    }
  };

  useLayoutEffect(() => {
    navigation.setOptions({
      headerLeft: () => (
        <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
          <Ionicons
            onPress={() => navigation.goBack()}
            name="arrow-back"
            size={24}
            color="black"
          />

          {selectedMessages.length > 0 ? (
            <View>
              <Text style={{ fontSize: 16, fontWeight: "500" }}>
                {selectedMessages.length}
              </Text>
            </View>
          ) : (
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Image
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: 15,
                  resizeMode: "cover",
                }}
                source={{ uri: recepientData?.image }}
              />

              <Text style={{ marginLeft: 5, fontSize: 15, fontWeight: "bold" }}>
                {recepientData?.name}
              </Text>
            </View>
          )}
        </View>
      ),
      headerRight: () => {
        if (selectedMessages.length > 0) {
          return (
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 10 }}
            >
              <Ionicons name="arrow-redo-sharp" size={24} color="black" />
              <Ionicons name="arrow-undo" size={24} color="black" />
              <FontAwesome name="star" size={24} color="black" />
              <MaterialIcons
                onPress={() => deleteMessages(selectedMessages)}
                name="delete"
                size={24}
                color="black"
              />
            </View>
          );
        } else {
          return null;
        }
      },
    });
  }, [navigation, recepientData, selectedMessages, lastSeen]);

  const deleteMessages = async (messageIds) => {
    try {
      const response = await fetch(
        "https://mentorship-backends-rahul-mistrys-projects.vercel.app/deleteMessages",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ messages: messageIds }),
        }
      );

      if (response.ok) {
        setSelectedMessages((prevSelectedMessages) =>
          prevSelectedMessages.filter((id) => !messageIds.includes(id))
        );

        fetchMessages();
      } else {
        console.log("error deleting messages", response.status);
      }
    } catch (error) {
      console.log("error deleting messages", error);
    }
  };

  const formatTime = (time) => {
    const options = { hour: "numeric", minute: "numeric" };
    return new Date(time).toLocaleString("en-US", options);
  };
  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    console.log(result);
    if (!result.canceled) {
      handleSend("image", result.uri);
    }
  };
  const handleSelectMessage = (message) => {
    //check if the message is already selected
    const isSelected = selectedMessages.includes(message._id);

    if (isSelected) {
      setSelectedMessages((previousMessages) =>
        previousMessages.filter((id) => id !== message._id)
      );
    } else {
      setSelectedMessages((previousMessages) => [
        ...previousMessages,
        message._id,
      ]);
    }
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#000000" />
        <Text style={{ marginTop: 10, color: "#000000" }}>Please wait...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: "#FFFFFF" }}
      behavior={Platform.OS === "ios" ? "padding" : null}
    >
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <View style={styles.userInfo}>
          <Pressable onPress={() => navigation.goBack()}>
            <FontAwesome name="angle-left" size={30} color="black" />
          </Pressable>
          <TouchableOpacity
            onPress={() => {
              if (recepientId !== "65fe947733f40267003d6fb7") {
                navigation.navigate("PublicProfile", { userId: recepientId });
              }
            }}
          >
            <Image
              style={styles.userImage}
              source={{ uri: recepientData?.image }}
            />
          </TouchableOpacity>
          <View style={{ flexDirection: "column" }}>
            <TouchableOpacity
              onPress={() => {
                if (recepientId !== "65fe947733f40267003d6fb7") {
                  navigation.navigate("PublicProfile", {
                    userId: recepientId,
                  });
                }
              }}
            >
              <Text style={styles.userName}>{recepientData?.name}</Text>

              {/* Conditionally render the Last Seen text */}
              {recepientId !== "65fe947733f40267003d6fb7" && (
                <Text style={styles.lastSeenText}>
                  {lastSeen
                    ? lastSeen === "Online"
                      ? "Online"
                      : `Last Seen: ${lastSeen}`
                    : ""}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Pressable
            onPress={() => console.log("Call")}
            style={{ marginRight: 10 }}
          >
            <MaterialCommunityIcons name="phone" size={24} color="black" />
          </Pressable>
          <Pressable onPress={() => console.log("More options")}>
            <Entypo name="dots-three-vertical" size={24} color="black" />
          </Pressable>
        </View>
      </View>
      <ScrollView
        ref={scrollViewRef}
        contentContainerStyle={{ flexGrow: 1 }}
        onContentSizeChange={handleContentSizeChange}
        scrollEnabled={true}
      >
        {messages.map((item, index) => {
          if (item.messageType === "text") {
            const isSelected = selectedMessages.includes(item._id);
            return (
              <Pressable
                onLongPress={() => handleSelectMessage(item)}
                key={index}
                style={[
                  item?.senderId?._id === userId
                    ? {
                        alignSelf: "flex-end",
                        backgroundColor: "#0077FF",
                        padding: 8,
                        maxWidth: "60%",
                        borderRadius: 10,
                        margin: 10,
                      }
                    : {
                        alignSelf: "flex-start",
                        backgroundColor: "#E8F0FE",
                        padding: 8,
                        margin: 10,
                        borderRadius: 10,
                        maxWidth: "60%",
                      },
                  isSelected && { width: "100%", backgroundColor: "#F0FFFF" },
                ]}
              >
                <Text
                  style={{
                    fontSize: 16,
                    color: isSelected
                      ? "#FFFFFF"
                      : item?.senderId?._id === userId
                      ? "#FFFFFF"
                      : "#000000",
                    textAlign: isSelected ? "right" : "left",
                  }}
                >
                  {item?.message}
                </Text>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    marginTop: 5,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 12,
                      color: isSelected
                        ? "#FFFFFF"
                        : item?.senderId?._id === userId
                        ? "#FFFFFF"
                        : "#808080",
                      marginRight: 5,
                    }}
                  >
                    {formatTime(item.timeStamp)}
                  </Text>
                  {renderMessageStatus(item)}
                </View>
              </Pressable>
            );
          }
        })}
      </ScrollView>

      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          paddingHorizontal: 10,
          paddingVertical: 10,
          borderTopWidth: 1,
          borderTopColor: "#CCCCCC",
          marginBottom: 10,
        }}
      >
        {recepientId !== "65fe947733f40267003d6fb7" && (
          <Entypo
            onPress={handleEmojiPress}
            style={{ marginRight: 5 }}
            name="emoji-happy"
            size={24}
            color="#0077FF"
          />
        )}

        {recepientId !== "65fe947733f40267003d6fb7" && (
          <TextInput
            value={message}
            onChangeText={(text) => setMessage(text)}
            style={{
              flex: 1,
              height: 40,
              borderWidth: 1,
              borderColor: "#CCCCCC",
              borderRadius: 20,
              paddingHorizontal: 10,
              color: "#000000",
            }}
            placeholder="Type Your message..."
            placeholderTextColor="#A9A9A9"
          />
        )}
        {recepientId === "65fe947733f40267003d6fb7" && (
          <TextInput
            editable={false}
            value={message}
            onChangeText={(text) => setMessage(text)}
            style={{
              flex: 1,
              height: 40,
              borderWidth: 1,
              borderColor: "#CCCCCC",
              borderRadius: 20,
              paddingHorizontal: 10,
              color: "#000000",
              textAlign: "center",
              backgroundColor: "#F2F2F2",
            }}
            placeholder="Disabled"
            placeholderTextColor="#A9A9A9"
          />
        )}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 7,
            marginHorizontal: 8,
          }}
        >
          {recepientId !== "65fe947733f40267003d6fb7" && (
            <Entypo
              onPress={pickImage}
              name="camera"
              size={24}
              color="#0077FF"
              style={{ opacity: 1 }}
            />
          )}
          {recepientId !== "65fe947733f40267003d6fb7" && (
            <Feather name="mic" size={24} color="#0077FF" />
          )}
        </View>

        <Pressable
          onPress={() => handleSend("text")}
          style={[
            styles.sendButton,
            recepientId === "65fe947733f40267003d6fb7" && {
              opacity: 0.5,
            },
          ]}
          disabled={recepientId === "65fe947733f40267003d6fb7"}
        >
          <Text style={{ color: "#FFFFFF", fontWeight: "bold" }}>Send</Text>
        </Pressable>
      </View>

      {showEmojiSelector && (
        <EmojiSelector
          onEmojiSelected={(emoji) => {
            setMessage((prevMessage) => prevMessage + emoji);
          }}
          style={{ height: 250 }}
        />
      )}
    </KeyboardAvoidingView>
  );
};

export default ChatMessagesScreen;
const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#CCCCCC",
    marginTop: Platform.OS === "ios" ? 35 : 25,
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  userImage: {
    width: 50,
    height: 50,
    borderRadius: 100,
    resizeMode: "cover",
    marginRight: 5,
    marginLeft: 10,
  },
  userName: {
    fontSize: 15,
    fontWeight: "bold",
    marginLeft: 10,
  },
  lastSeenText: {
    fontSize: 12,
    color: "#808080",
    marginLeft: 10,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: "#CCCCCC",
  },
  input: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderColor: "#CCCCCC",
    borderRadius: 20,
    paddingHorizontal: 10,
    color: "#000000",
    marginLeft: 5,
  },
  sendButton: {
    backgroundColor: "#0077FF",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    color: "#FFFFFF",
    fontWeight: "bold",
    marginLeft: 5,
  },
});
