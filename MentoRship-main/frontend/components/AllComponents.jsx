import React, { useState, useEffect, useContext } from "react";
import {
  View,
  Text,
  Image,
  Pressable,
  FlatList,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Feather } from "@expo/vector-icons";
import { UserType } from "../UserContext";
import RecommendedSessions from "./RecommendedSessions";
import * as Animatable from "react-native-animatable";

export default function AllComponents() {
  const navigation = useNavigation();
  const [users, setUsers] = useState([]);
  const [topics, setTopics] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [userType, setUserType] = useState("");
  const [loading, setLoading] = useState(true);
  const [loading2, setLoading2] = useState(true);
  const { userId } = useContext(UserType);

  useEffect(() => {
    fetchUserType();
    fetchTopics();
  }, []);

  const fetchUserType = async () => {
    try {
      const response = await fetch(
        `https://mentorship-backends-rahul-mistrys-projects.vercel.app/user-type/${userId}`
      );
      const data = await response.json();
      if (data.isMentor) {
        setUserType("mentor");
        fetchStudents();
      } else if (data.isStudent) {
        setUserType("student");
        fetchMentors();
      }
    } catch (error) {
      console.error("Error fetching user type:", error);
    }
  };

  const fetchMentors = async () => {
    try {
      const response = await fetch("https://mentorship-backends-rahul-mistrys-projects.vercel.app/mentors");
      const data = await response.json();
      setUsers(data.mentors);
    } catch (error) {
      console.error("Error fetching mentors:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchStudents = async () => {
    try {
      const response = await fetch("https://mentorship-backends-rahul-mistrys-projects.vercel.app/students");
      const data = await response.json();
      setUsers(data.students);
    } catch (error) {
      console.error("Error fetching students:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchTopics = async () => {
    try {
      const response = await fetch("https://mentorship-backends-rahul-mistrys-projects.vercel.app/topics");
      const data = await response.json();
      setTopics(data); // Assuming data is an array of topics
    } catch (error) {
      console.error("Error fetching topics:", error);
    } finally {
      setLoading2(false);
      setRefreshing(false);
    }
  };

  const navigateToPublicProfile = (userId) => {
    navigation.navigate("PublicProfile", { userId });
  };

  const renderUserItem = ({ item }) => (
    <Pressable onPress={() => navigateToPublicProfile(item._id)}>
      <Animatable.View animation="bounceIn" duration={1000}>
        <View
          style={{
            width: 150,
            height: 210,
            backgroundColor: "#F4F4F4",
            borderRadius: 20,
            borderColor: "#D9D9D9",
            borderWidth: 1,
            alignItems: "center",
            marginRight: 15,
            padding: 10,
            shadowColor: "#000",
            shadowOffset: {
              width: 5,
              height: 1,
            },
            shadowOpacity: 0.1,
            shadowRadius: 3.84,
            elevation: 5,
          }}
        >
          <Image
            source={{ uri: item.image }}
            style={{
              width: 120,
              height: 120,
              borderRadius: 60,
              marginBottom: 10,
            }}
          />
          <Text
            style={{
              fontWeight: "bold",
              fontSize: 16,
              textAlign: "center",
            }}
          >
            {item.name}
          </Text>
          <Text
            style={{
              fontSize: 12,
              color: "#777",
              textAlign: "center",
            }}
          >
            {item.Headline}
          </Text>
          {item.totalParticipants && (
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginTop: 5,
              }}
            >
              <Feather
                name="users"
                size={14}
                color="#1E90FF"
                style={{ marginRight: 5 }}
              />
              <Text
                style={{
                  fontSize: 12,
                  color: "#1E90FF",
                  textAlign: "center",
                }}
              >
                {item.totalParticipants}
              </Text>
            </View>
          )}
        </View>
      </Animatable.View>
    </Pressable>
  );

  const renderTopicItem = ({ item }) => (
    <Pressable
      onPress={() => {
        navigation.navigate("ChatS");
      }}
    >
      <View
        style={{
          width: 150,
          height: 210,
          backgroundColor: "#F4F4F4",
          borderRadius: 20,
          borderColor: "#D9D9D9",
          borderWidth: 1,
          alignItems: "center",
          marginRight: 15,
          marginBottom: 250,
          padding: 10,
          shadowColor: "#000",
          shadowOffset: {
            width: 5,
            height: 1,
          },
          shadowOpacity: 0.1,
          shadowRadius: 3.84,
          elevation: 5,
        }}
      >
        <Image
          source={{ uri: item.imageURL }}
          style={{
            width: 120,
            height: 120,
            borderRadius: 60,
            marginBottom: 10,
          }}
        />
        <Text
          style={{
            fontWeight: "bold",
            fontSize: 16,
            textAlign: "center",
          }}
        >
          {item.name}
        </Text>
        {item.totalParticipants && (
          <View
            style={{ flexDirection: "row", alignItems: "center", marginTop: 5 }}
          >
            <Feather
              name="users"
              size={14}
              color="#000"
              style={{ marginRight: 5 }}
            />
            <Text
              style={{
                fontSize: 12,
                color: "#000",
                textAlign: "center",
              }}
            >
              {item.totalParticipants + 1}
            </Text>
          </View>
        )}
      </View>
    </Pressable>
  );

  const onRefresh = () => {
    setRefreshing(true);
    if (userType === "mentor") {
      fetchStudents();
    } else if (userType === "student") {
      fetchMentors();
    }
    fetchTopics();
  };

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      style={{ backgroundColor: "#fff" }}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {loading ? (
        <ActivityIndicator size="small" color="#000" />
      ) : (
        <>
          <Text
            style={{
              fontWeight: "bold",
              fontSize: 20,
              marginHorizontal: 20,
              marginTop: 5,
              marginBottom: 20,
              color: "#333",
            }}
          >
            {userType === "mentor"
              ? "Recommended Mentees"
              : "Recommended Mentors"}
          </Text>
          <View style={{ marginBottom: 0 }}>
            <FlatList
              data={users}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 20 }}
              renderItem={renderUserItem}
              keyExtractor={(item) => item._id}
            />
          </View>
        </>
      )}
      <Text
        style={{
          fontWeight: "bold",
          fontSize: 20,
          marginHorizontal: 20,
          marginTop: 30,
          color: "#333",
        }}
      >
        Recommended Sessions
      </Text>
      <RecommendedSessions />

      <Text
        style={{
          fontWeight: "bold",
          fontSize: 20,
          marginHorizontal: 20,
          marginTop: 30,
          color: "#333",
          marginBottom: 10,
        }}
      >
        Recommended Topics
      </Text>
      {loading2 ? (
        <View style={{ flex: 1, height: 500 }}>
          <ActivityIndicator size="small" color="#000" />
        </View>
      ) : (
        <FlatList
          data={topics}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 20 }}
          renderItem={renderTopicItem}
          keyExtractor={(item, index) => index.toString()}
        />
      )}
    </ScrollView>
  );
}
