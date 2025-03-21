import React, { useContext } from "react";
import { View, Text, StyleSheet, Image, Pressable } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { UserType } from "../UserContext";

const TopicChat = ({ topic }) => {
  const navigation = useNavigation();
  const { userId } = useContext(UserType);

  const handlePress = () => {
    navigation.navigate("TopicChatMessages", {
      topicId: topic._id,
      userId: userId,
    });
  };

  return (
    <Pressable onPress={handlePress} style={styles.container}>
      <Image source={{ uri: topic?.imageURL }} style={styles.image} />
      <View style={styles.content}>
        <Text style={styles.topicName}>{topic.topicName}</Text>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#CCCCCC",
  },
  image: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 20,
  },
  content: {
    flex: 1,
  },
  topicName: {
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default TopicChat;
