import React, { useEffect, useState, useRef } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Platform,
  KeyboardAvoidingView,
  Keyboard,
  StatusBar,
  Pressable,
  Image,
  ActivityIndicator,
} from "react-native";
import { Entypo, MaterialCommunityIcons } from "@expo/vector-icons";
import { FontAwesome } from "@expo/vector-icons";
import { Feather } from "@expo/vector-icons";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";

const TopicChatMessagesScreen = ({ route, navigation }) => {
  const { topicId, userId } = route.params;
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const scrollViewRef = useRef(null);
  const [topicName, setTopicName] = useState("");
  const [topicImage, setTopicImage] = useState("");
  const [message, setMessage] = useState("");
  const [showEmojiSelector, setShowEmojiSelector] = useState(false);
  const [initialLoadingComplete, setInitialLoadingComplete] = useState(false);

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

  const formatTime = (time) => {
    const options = { hour: "numeric", minute: "numeric" };
    return new Date(time).toLocaleString("en-US", options);
  };

  const fetchTopicData = async () => {
    try {
      const response = await fetch(
        `https://mentorship-backends-rahul-mistrys-projects.vercel.app/topics/${topicId}/details`
      );
      const data = await response.json();
      if (response.ok) {
        setTopicName(data.topicName);
        setTopicImage(data.imageURL);
      } else {
        console.error("Error fetching topic data:", data.message);
      }
    } catch (error) {
      console.error("Error fetching topic data:", error);
    }
  };

  useEffect(() => {
    fetchTopicData();
  }, []);

  const fetchMessages = async () => {
    try {
      const response = await fetch(
        `https://mentorship-backends-rahul-mistrys-projects.vercel.app/topics/${topicId}/messages`
      );
      const data = await response.json();
      if (response.ok) {
        setMessages(data.messages);
      } else {
        console.error("Error fetching messages:", data.message);
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 5000);
    return () => clearInterval(interval);
  }, [topicId]);

  useEffect(() => {
    if (!loading && !initialLoadingComplete) {
      if (messages.length > 0) {
        scrollToBottom();
        setInitialLoadingComplete(true);
      }
    }
  }, [loading, initialLoadingComplete]);

  useEffect(() => {
    // Listen for keyboard events
    const keyboardDidShowListener = Keyboard.addListener(
      "keyboardDidShow",
      () => {
        scrollToBottom();
      }
    );

    // Cleanup function
    return () => {
      keyboardDidShowListener.remove();
    };
  }, []);

  const scrollToBottom = () => {
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollToEnd({ animated: false });
    }
  };

  const handleEmojiPress = () => {
    setShowEmojiSelector(!showEmojiSelector);
  };

  const sendMessage = async () => {
    if (!message.trim()) {
      return;
    }
    try {
      const response = await fetch(
        `https://mentorship-backends-rahul-mistrys-projects.vercel.app/topics/${topicId}/messages`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            senderId: userId,
            messageType: "text",
            messageText: message,
          }),
        }
      );
      const data = await response.json();
      if (response.ok) {
        setMessages((prevMessages) => [
          ...prevMessages,
          { ...data.message, senderName: "Wait", sent: true },
        ]);
        setMessage("");
        scrollToBottom();
      } else {
        console.error("Error sending message:", data.message);
      }
    } catch (error) {
      console.error("Error sending message:", error);
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
          {topicImage && (
            <TouchableOpacity>
              <Image style={styles.userImage} source={{ uri: topicImage }} />
            </TouchableOpacity>
          )}
          <View style={{ flexDirection: "column" }}>
            <TouchableOpacity>
              <Text style={styles.userName}>{topicName}</Text>
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
        contentContainerStyle={styles.scrollViewContent}
        onContentSizeChange={() => scrollToBottom()}
      >
        {messages.map((message, index) => (
          <View
            key={index}
            style={[
              styles.messageContainer,
              message.senderId === userId
                ? styles.myMessage
                : styles.otherMessage,
              message.senderId === userId && { justifyContent: "flex-end" },
            ]}
          >
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              {message.senderImage && (
                <Image
                  style={styles.senderImage}
                  source={{ uri: message.senderImage }}
                />
              )}
              <Text
                style={[
                  styles.senderName,
                  message.senderId === userId && styles.senderWhite,
                  { marginLeft: message.senderId === userId ? "auto" : 5 },
                ]}
              >
                {message.senderName}
              </Text>
            </View>

            <Text
              style={[
                styles.messageText,
                message.senderId === userId && styles.textWhite,
                {
                  marginTop: 5,
                  marginBottom: 5,
                  textAlign: message.senderId === userId ? "right" : "left",
                },
              ]}
            >
              {message.message}
            </Text>

            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                alignSelf:
                  message.senderId === userId ? "flex-end" : "flex-start",
              }}
            >
              <Text
                style={[
                  styles.timestamp,
                  message.senderId === userId && styles.timestampWhite,
                ]}
              >
                {formatTime(message.timestamp)}
              </Text>

              {message.sent && (
                <MaterialCommunityIcons
                  name="check"
                  size={16}
                  color={message.senderId === userId ? "#FFFFFF" : "#000000"}
                  style={{ marginLeft: 5 }}
                />
              )}
            </View>
          </View>
        ))}
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
        <Entypo
          onPress={handleEmojiPress}
          style={{ marginRight: 5 }}
          name="emoji-happy"
          size={24}
          color="#0077FF"
        />
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

        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 7,
            marginHorizontal: 8,
          }}
        >
          <Entypo
            onPress={pickImage}
            name="camera"
            size={24}
            color="#0077FF"
            style={{ opacity: 1 }}
          />
          <Feather name="mic" size={24} color="#0077FF" />
        </View>

        <Pressable onPress={sendMessage} style={[styles.sendButton]}>
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

const styles = StyleSheet.create({
  scrollViewContent: {
    flexGrow: 1,
    paddingVertical: 20,
  },
  messageContainer: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginHorizontal: 10,
    marginBottom: 10,
    borderRadius: 10,
    maxWidth: "80%",
  },
  myMessage: {
    alignSelf: "flex-end",
    backgroundColor: "#0077FF",
    color: "#FFFFFF",
    textAlign: "right", // Right-align text for my messages
  },
  otherMessage: {
    alignSelf: "flex-start",
    backgroundColor: "#E8F0FE",
    color: "#000000",
  },
  senderName: {
    fontWeight: "bold",
    marginBottom: 5,
    marginLeft: 5,
  },
  messageText: {
    fontSize: 16,
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
  senderWhite: {
    color: "#FFFFFF",
  },
  textWhite: {
    color: "#FFFFFF",
  },
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
  timestamp: {
    color: "#666666",
  },
  timestampWhite: {
    color: "#FFFFFF",
  },
  senderImage: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginRight: 5,
  },
});

export default TopicChatMessagesScreen;
