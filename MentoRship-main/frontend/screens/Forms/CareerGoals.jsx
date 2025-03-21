import React, { useState, useContext } from "react";
import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Platform,
} from "react-native";
import { CheckBox } from "react-native-elements";
import Icon from "react-native-vector-icons/FontAwesome5";
import { UserType } from "../../UserContext";
import axios from "axios";
const NavigationLine = ({ active }) => (
  <View
    style={{
      flex: 1,
      height: 5,
      backgroundColor: active ? "#57D5DB" : "#DBD4D4",
      marginHorizontal: 5,
    }}
  />
);

export default function CareerGoals({ navigation }) {
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
  });

  const handleCheckBoxChange = (key) => {
    setCheckBoxStates((prev) => ({ ...prev, [key]: !prev[key] }));
  };
  // Use userId to send
  const { userId, setUserId } = useContext(UserType);
  const [loading, setLoading] = useState(false);

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
  ];
  const isAtLeastOneSelected = Object.values(checkBoxStates).some(Boolean);

  const handleNext = async () => {
    const isAtLeastOneSelected = Object.values(checkBoxStates).some(Boolean);
    if (!isAtLeastOneSelected) {
      // Give alert to atleast one selected
      Alert.alert("Error", "Please select at least one career goal", [
        {
          text: "OK",
          style: "cancel",
        },
      ]);
      return;
    }
    setLoading(true);

    try {
      // Send a POST request to your backend endpoint
      const response = await axios.post(
        "https://mentorship-backends-rahul-mistrys-projects.vercel.app/onboarding/v4",
        {
          userId: userId, // Use the userId from your context or state
          careerGoals: Object.keys(checkBoxStates).filter(
            (key) => checkBoxStates[key]
          ),
        }
      );

      // Handle successful response (if needed)
      console.log(response.data);
      setLoading(false);
      // Navigate to the next screen
      navigation.navigate("Availability");
    } catch (error) {
      // Handle error
      console.error("Error updating career goals:", error);
      // Show an error message or handle the error accordingly
    }
  };

  return (
    <SafeAreaView
      style={{
        flex: 1,
        alignItems: "center",
        marginTop: 40,
      }}
    >
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
          marginBottom: 5,
        }}
      >
        Career Goals
      </Text>
      <View
        style={{
          width: 400,
          height: 1.5,
          backgroundColor: "#DBD4D4",
        }}
      ></View>
      <ScrollView vertical={true}>
        <Text
          style={{
            fontSize: 15,
            marginTop: 10,
            paddingHorizontal: 17,
          }}
        >
          Welcome to our comprehensive Career Hub, where your professional
          journey begins and thrives. Our Career Page is designed to provide you
          with a wealth of resources and opportunities to navigate the various
          stages of your career development. Explore the following key sections
          to unlock your full potential
        </Text>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: "#F1F1F3",
            width: "88%",
            height: 50,
            borderRadius: 20,
            marginTop: 15,
            paddingHorizontal: 20,
            borderColor: "#D9D9D9",
            borderWidth: 1,
            marginHorizontal: 15,
            marginBottom: 20,
          }}
        >
          <Icon name="search" size={15} color="#9C9C9C" />
          <TextInput
            placeholder="Search Here"
            style={{ flex: 1, marginLeft: 10 }}
          />
        </View>

        {careerGoalsList.map((goal, index) => (
          <CheckBox
            key={index}
            title={goal}
            checked={checkBoxStates[goal]}
            onPress={() => handleCheckBoxChange(goal)}
            containerStyle={{
              backgroundColor: "#F1F1F3",
              width: "90%",
              height: 50,
              borderRadius: 20,
              marginTop: 5,
              justifyContent: "space-between",
              marginHorizontal: 15,
              borderWidth: 1,
              borderColor: "#D9D9D9",
            }}
            textStyle={{ marginLeft: 5, fontSize: 15 }}
            checkedColor="#57D5DB"
          />
        ))}
      </ScrollView>

      <View
        style={{
          flexDirection: "row",
          height: 10,
          marginVertical: 10,
        }}
      >
        <NavigationLine active={true} />
        <NavigationLine active={true} />
        <NavigationLine active={true} />
        <NavigationLine active={true} />
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
          marginBottom: Platform.OS === "ios" ? -10 : 10,
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
    </SafeAreaView>
  );
}
