import React, { useState, useEffect, useContext } from "react";
import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Modal,
  StatusBar,
} from "react-native";
import Icon from "react-native-vector-icons/FontAwesome5";
import { UserType } from "../../UserContext";
import axios from "axios";
import { CheckBox } from "react-native-elements";

const NavigationLine = ({ active }) => (
  <View
    style={{
      flex: 1,
      height: 5,
      backgroundColor: active ? "#57D5DB" : "#DBD4D4",
      marginHorizontal: 15,
    }}
  />
);

const RadioButton = ({ selected, label, description, onPress }) => (
  <TouchableOpacity
    style={{ flexDirection: "row", alignItems: "center", marginTop: 20 }}
    onPress={onPress}
  >
    <Icon
      name={selected ? "check-circle" : "circle"}
      size={20}
      color={selected ? "#57D5DB" : "#DBD4D4"}
      style={{ marginRight: 10 }}
    />
    <View style={{ flexDirection: "column" }}>
      <Text style={{ fontWeight: "500", fontSize: 16, marginBottom: 5 }}>
        {label}
      </Text>
      <Text style={{ color: "#9C9C9C", fontSize: 12 }}>{description}</Text>
    </View>
  </TouchableOpacity>
);

export default function CreateNewSession({ navigation }) {
  const [characterCount, setCharacterCount] = useState(0);
  const { userId, setUserId, sessionId, setSessionId } = useContext(UserType);
  const [loading, setLoading] = useState(false);
  const [isPublic, setIsPublic] = useState(true);
  const [sessionName, setSessionName] = useState("");
  const [sessionDescription, setSessionDescription] = useState("");
  const [goalsModalVisible, setGoalsModalVisible] = useState(false);
  const [selectedGoals, setSelectedGoals] = useState([]);
  const [checkBoxStates, setCheckBoxStates] = useState({
    getInternship: false,
    prepareForInterviews: false,
    buildResume: false,
    prepareForGradSchool: false,
    communicate: false,
    motivate: false,
    buildLeadership: false,
    network: false,
    managePriorities: false,
    selfAwareness: false,
    createWork: false,
    changeRoles: false,
    createCareerPlans: false,
    others: false,
  });

  const maxCharacterLimit = 75;

  useEffect(() => {
    console.log(sessionId);
  }, [sessionId]);

  const handleNext = async () => {
    if (!sessionName || !sessionDescription || selectedGoals.length === 0) {
      Alert.alert("Validation Error", "Please fill in all fields.");
      return;
    }

    setLoading(true);

    const sessionData = {
      createdBy: userId,
      sessionName: sessionName,
      description: sessionDescription,
      careerGoals: selectedGoals,
      public: isPublic,
    };

    try {
      const response = await axios.post(
        "https://mentorship-backends-rahul-mistrys-projects.vercel.app/create-session",
        sessionData
      );
      // Save the session ID in the UserType context
      await setSessionId(response.data.sessionId);

      navigation.navigate("InviteParticipants");
    } catch (error) {
      console.error("Error creating session:", error);
      Alert.alert("Error", "Failed to create session. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCheckBoxChange = (key) => {
    setCheckBoxStates((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const openGoalsModal = () => {
    setGoalsModalVisible(true);
  };

  const closeGoalsModal = () => {
    setGoalsModalVisible(false);
  };

  const saveSelectedGoals = () => {
    const selected = Object.keys(checkBoxStates).filter(
      (key) => checkBoxStates[key]
    );
    setSelectedGoals(selected);
    closeGoalsModal();
  };

  const careerGoalsList = [
    "Get Internship/Job",
    "Prepare for Interviews",
    "Build Resume",
    "Prepare for Graduate School",
    "Communicate Effectively",
    "Motivate, Coach and Develop Others",
    "Build Leadership Skills",
    "Network with Others",
    "Manage Priorities",
    "Increase Self-Awareness",
    "Create Work/Life Balance",
    "Change Roles/Career",
    "Get Promoted",
    "Create Career Plan",
    "Others",
  ];

  const isAtLeastOneSelected = Object.values(checkBoxStates).some(Boolean);

  return (
    <SafeAreaView
      style={{
        flex: 1,
        alignItems: "center",
        marginTop: 40,
      }}
    >
      <StatusBar barStyle="dark-content" />
      <TouchableOpacity
        onPress={() => {
          navigation.goBack();
        }}
        style={{
          position: "absolute",
          top: 3,
          left: 20,
          justifyContent: "center",
          alignItems: "center",
          flexDirection: "row",
        }}
      >
        <Icon name="chevron-left" size={24} color="#000" />
      </TouchableOpacity>
      <Text
        style={{
          fontWeight: "bold",
          fontSize: 20,
          marginBottom: 10,
        }}
      >
        Create New Session
      </Text>
      <View
        style={{
          width: 400,
          height: 1.5,
          backgroundColor: "#DBD4D4",
        }}
      ></View>

      <ScrollView vertical={true}>
        <View
          style={{
            paddingHorizontal: 15,
          }}
        >
          <Text style={{ marginTop: 15, fontWeight: 500 }}>
            Enter Session Name
          </Text>
          <TextInput
            placeholder="Enter Your Session Name here                                        "
            style={{
              backgroundColor: "#F1F1F3",
              width: 350,
              height: 50,
              borderRadius: 20,
              marginTop: 15,
              paddingHorizontal: 20,
              borderColor: "#D9D9D9",
              borderWidth: 1,
            }}
            onChangeText={(text) => {
              setSessionName(text);
              setCharacterCount(text.length);
            }}
          />
          <Text style={{ marginTop: 5, color: "#9C9C9C" }}>
            {characterCount}/{maxCharacterLimit}
          </Text>

          <View>
            <Text style={{ marginTop: 15, fontWeight: 500, marginBottom: 15 }}>
              Description
            </Text>
            <TextInput
              style={{
                backgroundColor: "#F1F1F3",
                width: 350,
                height: 150,
                borderRadius: 20,
                paddingVertical: 10,
                paddingHorizontal: 10,
                borderColor: "#D9D9D9",
                borderWidth: 1,
                textAlignVertical: "top",
              }}
              onChangeText={(text) => setSessionDescription(text)}
              multiline={true}
              numberOfLines={4}
              returnKeyType="done"
            />
          </View>
          <View>
            <Text style={{ marginTop: 15, fontWeight: 500 }}>Goals</Text>
            <TouchableOpacity
              onPress={openGoalsModal}
              style={{
                backgroundColor: "#F1F1F3",
                width: 350,
                height: 50,
                borderRadius: 20,
                marginTop: 15,
                paddingHorizontal: 20,
                borderColor: "#D9D9D9",
                borderWidth: 1,
                justifyContent: "center",
              }}
            >
              <Text>Select Goals</Text>
            </TouchableOpacity>
          </View>
          <RadioButton
            selected={isPublic}
            label="Public Session"
            description="Available for anyone in the community to join"
            onPress={() => setIsPublic(true)}
          />
          <RadioButton
            selected={!isPublic}
            label="Private Session"
            description="Only invited members can access"
            onPress={() => setIsPublic(false)}
          />
        </View>
      </ScrollView>

      <View
        style={{
          flexDirection: "row",
          height: 10,
          marginVertical: 10,
        }}
      >
        <NavigationLine active={true} />
        <NavigationLine active={false} />
        <NavigationLine active={false} />
        <NavigationLine active={false} />
      </View>
      <TouchableOpacity
        onPress={handleNext}
        style={{
          backgroundColor: "#09A1F6",
          padding: 10,
          borderRadius: 30,
          width: "90%",
          height: 50,
          justifyContent: "center",
          alignItems: "center",
          marginBottom: 10,
        }}
      >
        {loading ? (
          <ActivityIndicator color="#FFFFFF" size="small" />
        ) : (
          <Text
            style={{
              fontSize: 20,
              color: "#FFFFFF",
              fontWeight: "bold",
            }}
          >
            Next
          </Text>
        )}
      </TouchableOpacity>

      {/* Goals Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={goalsModalVisible}
        onRequestClose={closeGoalsModal}
      >
        <TouchableOpacity
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "rgba(0, 0, 0, 0.05)",
          }}
          activeOpacity={1}
          onPress={closeGoalsModal}
        >
          <View
            style={{
              backgroundColor: "#FFFFFF",
              borderRadius: 20,
              padding: 20,
              width: "80%",
            }}
          >
            <ScrollView style={{ maxHeight: 300 }}>
              {careerGoalsList.map((goal, index) => (
                <CheckBox
                  key={index}
                  title={goal}
                  checked={checkBoxStates[goal]}
                  onPress={() => handleCheckBoxChange(goal)}
                />
              ))}
            </ScrollView>
            <TouchableOpacity
              onPress={saveSelectedGoals}
              style={{
                backgroundColor: "#09A1F6",
                padding: 10,
                borderRadius: 30,
                width: "100%",
                justifyContent: "center",
                alignItems: "center",
                marginTop: 10,
              }}
            >
              <Text style={{ color: "#FFFFFF", fontWeight: "bold" }}>Save</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}
