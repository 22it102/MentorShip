import React, { useState, useEffect, useContext } from "react";
import {
  View,
  Text,
  Image,
  Pressable,
  FlatList,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { UserType } from "../UserContext";
import * as Animatable from "react-native-animatable";

export default function RecommendedSessions() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();
  const { userId } = useContext(UserType);

  useEffect(() => {
    fetchRecommendedSessions();
  }, []);

  const fetchRecommendedSessions = async () => {
    try {
      const response = await fetch(
        "https://mentorship-backends-rahul-mistrys-projects.vercel.app/recommended-sessions"
      );
      const data = await response.json();
      const formattedSessions = data.sessions.map((session) => ({
        ...session,
        date: formatDate(session.date),
        attendees: session.attendees || [],
      }));
      setSessions(formattedSessions);

      // Fetch attendee status for each session
      fetchAttendeeStatusForSessions(formattedSessions);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching recommended sessions:", error);
      setLoading(false);
    }
  };

  const fetchAttendeeStatusForSessions = async (sessions) => {
    const updatedSessions = await Promise.all(
      sessions.map(async (session) => {
        const status = await fetchAttendeeStatus(session._id, userId);
        return { ...session, attendeeStatus: status };
      })
    );
    setSessions(updatedSessions);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const options = {
      weekday: "short",
      month: "short",
      day: "2-digit",
      year: "numeric",
    };
    const formattedDate = date.toLocaleDateString("en-US", options);
    return formattedDate.toUpperCase();
  };

  const fetchAttendeeStatus = async (sessionId, userId) => {
    try {
      const response = await fetch(
        `https://mentorship-backends-rahul-mistrys-projects.vercel.app/attendee-status/${sessionId}/${userId}`
      );
      const data = await response.json();
      return data.status;
    } catch (error) {
      console.error("Error fetching attendee status:", error);
      return "none";
    }
  };

  const attendSession = async (sessionId, userId) => {
    try {
      const response = await fetch(
        `https://mentorship-backends-rahul-mistrys-projects.vercel.app/attend-session/${sessionId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ userId }),
        }
      );
      const data = await response.json();
    } catch (error) {
      console.error("Error attending session:", error);
    }
  };

  const handleAttendeeAction = async (sessionId) => {
    try {
      const session = sessions.find((session) => session._id === sessionId);
      if (!session) {
        return;
      }

      const { attendeeStatus } = session;
      switch (attendeeStatus) {
        case "attending":
          break;
        case "pending":
          break;
        default:
          if (session.public) {
            await attendSession(sessionId, userId);
            updateAttendeeStatus(sessionId, "attending");
          } else {
            updateAttendeeStatus(sessionId, "pending");
          }
          break;
      }
    } catch (error) {
      console.error("Error handling attendee action:", error);
    }
  };

  const updateAttendeeStatus = (sessionId, status) => {
    const updatedSessions = sessions.map((session) =>
      session._id === sessionId
        ? { ...session, attendeeStatus: status }
        : session
    );
    setSessions(updatedSessions);
  };

  const renderButton = (attendeeStatus) => {
    switch (attendeeStatus) {
      case "attending":
        return { text: "Attending", style: styles.attendingButton };
      case "pending":
        return { text: "Request Sent", style: styles.requestSentButton };
      default:
        return { text: "Request", style: styles.attendButton };
    }
  };

  const renderItem = ({ item }) => {
    const {
      _id,
      banner,
      date,
      sessionName,
      createdBy,
      public: isPublic,
      attendeeStatus,
    } = item;
    const { name, image } = createdBy;

    const { text, style } = renderButton(attendeeStatus);

    return (
      <Pressable
        onPress={() => navigation.navigate("Sessions", { sessionId: _id })}
      >
        <Animatable.View animation="fadeInUpBig" duration={1500}>
          <View style={styles.sessionContainer}>
            <Image
              source={{ uri: banner }}
              style={styles.sessionImage}
              resizeMode="cover"
            />
            <View style={styles.sessionDetails}>
              <Text style={styles.date}>{date}</Text>
              <Text style={styles.sessionName}>{sessionName}</Text>
              <View style={styles.hostedByContainer}>
                <Image source={{ uri: image }} style={styles.hostedImage} />
                <Text style={styles.hostedByText}>
                  Hosted by <Text style={{ fontWeight: "bold" }}>{name}</Text>
                </Text>
              </View>
              <Text style={styles.sessionType}>
                {isPublic ? "Public" : "Private"}
              </Text>
              <View style={styles.buttonContainer}>
                <Pressable
                  style={style}
                  onPress={() => handleAttendeeAction(_id)}
                >
                  <Text style={styles.attendButtonText}>{text}</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </Animatable.View>
      </Pressable>
    );
  };

  return (
    <View style={{ flex: 1 }}>
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color="#000" />
        </View>
      ) : (
        <FlatList
          data={sessions}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.container}
          renderItem={renderItem}
          keyExtractor={(item) => item._id}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  sessionContainer: {
    width: 300,
    height: 290,
    borderRadius: 20,
    backgroundColor: "#F4F4F4",
    marginTop: 20,
    marginHorizontal: 10,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#D9D9D9",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  sessionImage: {
    width: "100%",
    height: 120,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  sessionDetails: {
    padding: 10,
  },
  sessionName: {
    fontWeight: "bold",
    fontSize: 16,
    marginBottom: 5,
  },
  date: {
    fontSize: 12,
    marginBottom: 5,
  },
  hostedByContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  hostedImage: {
    width: 20,
    height: 20,
    borderRadius: 10,
    marginRight: 5,
  },
  hostedByText: {
    fontSize: 14,
    flexShrink: 1,
  },
  buttonContainer: {
    alignItems: "center",
    marginTop: 10,
  },
  attendButton: {
    backgroundColor: "#09A1F6",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
    justifyContent: "center",
    alignItems: "center",
  },
  attendButtonText: {
    color: "white",
    fontWeight: "bold",
  },
  attendingButton: {
    backgroundColor: "#4CAF50",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
    justifyContent: "center",
    alignItems: "center",
  },
  requestSentButton: {
    backgroundColor: "#FFC107",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
    justifyContent: "center",
    alignItems: "center",
  },
  sessionType: {
    fontSize: 12,
    marginTop: 5,
    color: "#666",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
