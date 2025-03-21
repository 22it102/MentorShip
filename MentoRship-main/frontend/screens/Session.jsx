import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StatusBar,
  TouchableOpacity,
  Image,
  ScrollView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialIcons } from "@expo/vector-icons";

export default function Session({ route, navigation }) {
  const { sessionId } = route.params;
  const [sessionDetails, setSessionDetails] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch session details from API
    fetchSessionDetails();
  }, []);

  const fetchSessionDetails = async () => {
    try {
      const response = await fetch(`https://mentorship-backends-rahul-mistrys-projects.vercel.app/${sessionId}`);
      const data = await response.json();
      setSessionDetails(data.session);
    } catch (error) {
      console.error("Error fetching session details:", error);
    } finally {
      setLoading(false);
    }
  };
  const handleAttendeeAction = async (sessionId) => {
    console.log("Attending");
  };

  if (!sessionDetails) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="small" color="#000" />
      </View>
    );
  }

  const {
    sessionName,
    description,
    createdBy,
    date,
    time,
    public: isPublic,
    careerGoals,
    attendees,
    banner,
  } = sessionDetails;

  const formattedDate = new Date(date).toLocaleDateString("en-US", {
    weekday: "short",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  // Format time to HH:MM
  const formattedTime = new Date(time).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
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
          marginTop: 45,
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
            fontFamily: Platform.OS === "ios" ? "System" : "sans-serif",
          }}
        >
          Sessions
        </Text>
      </View>
      <ScrollView
        style={{
          flex: 1,
          borderTopStartRadius: 50,
          borderTopEndRadius: 50,
          backgroundColor: "#FFFFFF",
          marginTop: 20,
          padding: 20,
        }}
        showsVerticalScrollIndicator={false}
      >
        {loading || !sessionDetails ? (
          <View
            style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
          >
            <ActivityIndicator size="large" color="#000" />
          </View>
        ) : (
          <>
            <View
              style={{
                backgroundColor: "#FFFFFF",
                padding: 20,
                borderRadius: 20,
                marginBottom: 20,
              }}
            >
              <Text
                style={{
                  fontSize: 24,
                  fontWeight: "bold",
                  color: "#000000",
                  marginBottom: 10,
                }}
              >
                {sessionName}
              </Text>
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Image
                  source={{ uri: createdBy.image }}
                  style={{
                    width: 30,
                    height: 30,
                    borderRadius: 15,
                    marginRight: 10,
                  }}
                />
                <Text style={{ fontSize: 16, color: "#000000" }}>
                  Organized by: {createdBy.name}
                </Text>
              </View>
              <Image
                source={{ uri: banner }}
                style={{
                  width: "100%",
                  height: 200,
                  borderRadius: 10,
                  marginTop: 20,
                  marginBottom: 20,
                }}
                resizeMode="cover"
              />
              <Text
                style={{
                  fontSize: 18,
                  fontWeight: "bold",
                  color: "#007CB0",
                  marginTop: 20,
                }}
              >
                Description
              </Text>
              <Text style={{ fontSize: 16, color: "#000000", marginTop: 10 }}>
                {description}
              </Text>
              <View style={{ alignItems: "center" }}>
                <TouchableOpacity
                  style={{
                    backgroundColor: "#09A1F6",
                    paddingHorizontal: 20,
                    paddingVertical: 10,
                    borderRadius: 5,
                    justifyContent: "center",
                    alignItems: "center",
                    marginBottom: 20,
                    marginTop: 10,
                    width: 250,
                    height: 45,
                  }}
                  onPress={() => handleAttendeeAction(sessionId)}
                >
                  <Text
                    style={{ color: "white", fontWeight: "bold", fontSize: 16 }}
                  >
                    Request
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={{ paddingHorizontal: 20 }}>
              <Text
                style={{
                  fontSize: 18,
                  fontWeight: "bold",
                  marginTop: -20,
                  color: "#007CB0",
                }}
              >
                Details
              </Text>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginTop: 10,
                }}
              >
                <MaterialIcons name="date-range" size={20} color="#007CB0" />
                <Text style={{ fontSize: 16, marginLeft: 10 }}>
                  Date: {formattedDate}
                </Text>
              </View>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginTop: 5,
                }}
              >
                <MaterialIcons name="access-time" size={20} color="#007CB0" />
                <Text style={{ fontSize: 16, marginLeft: 10 }}>
                  Time: {formattedTime}
                </Text>
              </View>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginTop: 5,
                }}
              >
                <MaterialIcons name="visibility" size={20} color="#007CB0" />
                <Text style={{ fontSize: 16, marginLeft: 10 }}>
                  Session Type: {isPublic ? "Public" : "Private"}
                </Text>
              </View>
              <Text
                style={{
                  fontSize: 18,
                  fontWeight: "bold",
                  marginTop: 20,
                  color: "#007CB0",
                }}
              >
                Session Goals
              </Text>
              <Text style={{ fontSize: 16, marginTop: 10 }}>
                {careerGoals.join(", ")}
              </Text>
              <Text
                style={{
                  fontSize: 18,
                  fontWeight: "bold",
                  marginTop: 20,
                  color: "#007CB0",
                }}
              >
                Attendees
              </Text>
              <ScrollView
                horizontal
                style={{ marginTop: 10, paddingBottom: 50 }}
              >
                {attendees.map((attendee) => (
                  <Image
                    key={attendee.userId}
                    source={{ uri: attendee.image }}
                    style={{
                      width: 50,
                      height: 50,
                      borderRadius: 25,
                      marginRight: 10,
                    }}
                  />
                ))}
              </ScrollView>
            </View>
          </>
        )}
      </ScrollView>
    </LinearGradient>
  );
}
