import React, { useState, useEffect, useContext } from "react";
import {
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Image,
  Platform,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { UserType } from "../../UserContext";
import Icon from "react-native-vector-icons/FontAwesome5";
import { MaterialIcons } from "@expo/vector-icons";

export default function MyEvents({ navigation }) {
  const [displayType, setDisplayType] = useState("Upcoming");
  const [sessions, setSessions] = useState([]);
  const { userId } = useContext(UserType);
  const navigateBack = () => {
    navigation.goBack();
  };
  useEffect(() => {
    async function fetchSessions() {
      try {
        const response = await fetch(
          `https://mentorship-backends-rahul-mistrys-projects.vercel.app/user-sessions/${userId}`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch sessions");
        }
        const data = await response.json();
        const updatedSessions = await Promise.all(
          data.sessions.map(async (session) => {
            const organizer = await fetchOrganizer(session.createdBy);
            return { ...session, organizer };
          })
        );
        setSessions(updatedSessions);
      } catch (error) {
        console.error("Error fetching sessions:", error);
      }
    }

    fetchSessions();
  }, [userId]);

  async function fetchOrganizer(userId) {
    try {
      const response = await fetch(`https://mentorship-backends-rahul-mistrys-projects.vercel.app/${userId}/name`);
      if (!response.ok) {
        throw new Error("Failed to fetch organizer details");
      }
      const userData = await response.json();
      return userData.name;
    } catch (error) {
      console.error("Error fetching organizer details:", error);
      return "Unknown";
    }
  }

  // Filter sessions based on display type (Upcoming or Past)
  const filteredSessions = sessions.filter((session) => {
    const sessionDate = new Date(session.date);
    const currentDate = new Date();
    if (displayType === "Upcoming") {
      return sessionDate >= currentDate;
    } else {
      return sessionDate < currentDate;
    }
  });

  return (
    <LinearGradient
      colors={["#000000", "#007CB0"]}
      style={{ flex: 1 }}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
      locations={[0.3, 1]}
    >
      <StatusBar barStyle="light-content" />
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          paddingHorizontal: 20,
          marginTop: Platform.OS === "ios" ? 55 : 45,
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
          My Events
        </Text>
      </View>
      <View
        style={{
          flex: 1,
          backgroundColor: "#FFFFFF",
          borderTopStartRadius: 50,
          borderTopEndRadius: 50,
          paddingHorizontal: 20,
          paddingTop: 20,
          marginTop: 20,
          paddingBottom: 20,
          borderWidth: 1,
          borderColor: "#E5E5E5",
        }}
      >
        <View
          style={{
            flexDirection: "row",
            justifyContent: "center",
            marginBottom: 20,
            gap: 20,
          }}
        >
          <TouchableOpacity onPress={() => setDisplayType("Upcoming")}>
            <View
              style={{
                borderBottomWidth: displayType === "Upcoming" ? 3 : 0,
                borderColor:
                  displayType === "Upcoming" ? "#00FFFF" : "transparent",
                paddingBottom: displayType === "Upcoming" ? 5 : 0,
              }}
            >
              <Text
                style={{
                  fontSize: 20,
                  fontWeight: displayType === "Upcoming" ? "bold" : "normal",
                  color: "#000000",
                }}
              >
                Upcoming
              </Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setDisplayType("Past")}>
            <View
              style={{
                borderBottomWidth: displayType === "Past" ? 3 : 0,
                borderColor: displayType === "Past" ? "#00FFFF" : "transparent",
                paddingBottom: displayType === "Past" ? 5 : 0,
              }}
            >
              <Text
                style={{
                  fontSize: 20,
                  fontWeight: displayType === "Past" ? "bold" : "normal",
                  color: "#000000",
                }}
              >
                Past
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        <ScrollView>
          {filteredSessions.map((session, index) => (
            <View
              key={index}
              style={{ marginBottom: 20, alignItems: "center" }}
            >
              {/* Display session banner image */}
              {session.banner && (
                <Image
                  source={{ uri: session.banner }}
                  style={{
                    width: "100%",
                    height: 200,
                    borderRadius: 10,
                    marginBottom: 10,
                  }}
                />
              )}

              <Text
                style={{
                  fontSize: 18,
                  fontWeight: "bold",
                  color: "#000000",
                  marginBottom: 5,
                }}
              >
                {session.sessionName}
              </Text>
              <Text style={{ color: "#757575", marginBottom: 5 }}>
                Organizer:{" "}
                <Text style={{ color: "#09A1E6" }}>{session.organizer}</Text>
              </Text>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginBottom: 5,
                }}
              >
                <Icon name="calendar" size={16} color="#757575" />
                <Text style={{ marginLeft: 5 }}>
                  {new Date(session.date).toLocaleDateString("en-US", {
                    weekday: "long",
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </Text>
              </View>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginBottom: 5,
                }}
              >
                <Icon name="clock" size={16} color="#757575" />
                <Text style={{ marginLeft: 5 }}>
                  {session.time.substring(11, session.time.length - 8)} (
                  {session.duration} min)
                </Text>
              </View>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginBottom: 5,
                }}
              >
                <Icon
                  name={displayType === "Upcoming" ? "clock" : "check-circle"}
                  size={16}
                  color={displayType === "Upcoming" ? "#007CB0" : "#4CAF50"}
                />
                <Text style={{ marginLeft: 5 }}>
                  {displayType === "Upcoming" ? "Attending" : "Attended"}
                </Text>
              </View>

              <TouchableOpacity
                style={{
                  backgroundColor: "#007CB0",
                  paddingVertical: 10,
                  paddingHorizontal: 20,
                  borderRadius: 5,
                  marginTop: 10,
                  alignItems: "center",
                }}
              >
                <Text style={{ color: "#FFFFFF" }}>View Session</Text>
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>
      </View>
    </LinearGradient>
  );
}
