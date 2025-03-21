import React, { useContext, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  TextInput,
  StatusBar,
  ActivityIndicator,
  ActionSheetIOS,
  Platform,
} from "react-native";
import Icon from "react-native-vector-icons/FontAwesome5";
import axios from "axios";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Picker } from "@react-native-picker/picker";
import { UserType } from "../../UserContext";

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

const ScheduleSession = ({ navigation }) => {
  const [date, setDate] = useState(new Date());
  const [time, setTime] = useState(new Date());
  const [duration, setDuration] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const { sessionId } = useContext(UserType);
  const [toastMessage, setToastMessage] = useState("");

  const handleDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || date;
    setShowDatePicker(false);
    setDate(currentDate);
  };

  const handleTimeChange = (event, selectedTime) => {
    const currentTime = selectedTime || time;
    setShowTimePicker(false);
    setTime(currentTime);
  };

  const showToastMessage = (message) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage("");
    }, 1000); // Set a timeout to hide the message after 3 seconds
  };

  const handleSelectSchedule = async () => {
    setIsLoading(true);
    try {
      const response = await axios.post(
        `https://mentorship-backends-rahul-mistrys-projects.vercel.app/select-schedule/${sessionId}`,
        { date, time, duration }
      );
      console.log("Response:", response.data);
      showToastMessage("Session Successfully created");
      setTimeout(() => {
        navigation.navigate("Sessions");
      }, 1500);
    } catch (error) {
      console.error("Error selecting schedule:", error);
      // Handle error
    } finally {
      setIsLoading(false);
    }
  };

  const showDurationActionSheet = () => {
    const durations = [
      "Select Duration",
      "15 min",
      "30 min",
      "45 min",
      "60 min",
      "90 min",
      "More than 90 min",
      "Cancel",
    ];
    ActionSheetIOS.showActionSheetWithOptions(
      {
        options: durations,
        cancelButtonIndex: durations.length - 1,
      },
      (buttonIndex) => {
        if (buttonIndex !== durations.length - 1) {
          // Extract the numeric value from the selected option
          const selectedDuration = durations[buttonIndex];
          const numericValue = parseInt(selectedDuration.split(" ")[0]);
          setDuration(numericValue);
        }
      }
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, marginTop: 40 }}>
      <StatusBar barStyle="dark-content" />
      <TouchableOpacity
        onPress={() => navigation.goBack()}
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
          textAlign: "center",
        }}
      >
        Schedule
      </Text>
      <View
        style={{
          width: 400,
          height: 1.5,
          backgroundColor: "#DBD4D4",
        }}
      ></View>
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: 20,
        }}
      >
        <View style={{ marginLeft: 10 }}>
          <Text
            style={{
              fontSize: 15,
              marginTop: 15,
              color: "#5A5A5A",
              marginBottom: 15,
            }}
          >
            Date
          </Text>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <TouchableOpacity
              onPress={() => setShowDatePicker(true)}
              style={{
                flex: 1,
                flexDirection: "row",
                alignItems: "center",
                borderColor: "#D9D9D9",
                borderWidth: 1,
                borderRadius: 5,
                paddingHorizontal: 10,
                marginBottom: 20,
                height: 50,
              }}
            >
              <Text style={{ flex: 1 }}>{date.toDateString()}</Text>
              <Icon
                name="calendar-alt"
                size={20}
                color="#555"
                style={{ marginRight: 10 }}
              />
            </TouchableOpacity>
          </View>
          {showDatePicker && (
            <DateTimePicker
              value={date}
              mode="date"
              display="default"
              onChange={handleDateChange}
            />
          )}
        </View>
        <View style={{ marginLeft: 10 }}>
          <Text
            style={{
              fontSize: 15,
              marginTop: 15,
              color: "#5A5A5A",
              marginBottom: 15,
            }}
          >
            Time
          </Text>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <TouchableOpacity
              onPress={() => setShowTimePicker(true)}
              style={{
                flex: 1,
                flexDirection: "row",
                alignItems: "center",
                borderColor: "#D9D9D9",
                borderWidth: 1,
                borderRadius: 5,
                paddingHorizontal: 10,
                marginBottom: 20,
                height: 50,
              }}
            >
              <Text style={{ flex: 1 }}>{time.toLocaleTimeString()}</Text>
              <Icon
                name="clock"
                size={20}
                color="#555"
                style={{ marginRight: 10 }}
              />
            </TouchableOpacity>
          </View>
          {showTimePicker && (
            <DateTimePicker
              value={time}
              mode="time"
              display="default"
              onChange={handleTimeChange}
            />
          )}
        </View>
        {Platform.OS === "android" && (
          <View style={{ marginLeft: 10 }}>
            <Text
              style={{
                fontSize: 15,
                marginTop: 15,
                color: "#5A5A5A",
                marginBottom: 15,
              }}
            >
              Duration
            </Text>
            <View
              style={{
                borderColor: "#D9D9D9",
                borderWidth: 1,
                borderRadius: 5,
                paddingHorizontal: 10,
                marginBottom: 20,
                height: 50,
              }}
            >
              <Picker
                selectedValue={duration}
                onValueChange={(itemValue) => setDuration(itemValue)}
                style={{ height: 40, width: "100%", alignSelf: "center" }}
                mode="dropdown"
              >
                <Picker.Item label="Select Duration" value="" />
                <Picker.Item label="15 min" value="15" />
                <Picker.Item label="30 min" value="30" />
                <Picker.Item label="45 min" value="45" />
                <Picker.Item label="60 min" value="60" />
                <Picker.Item label="90 min" value="90" />
                <Picker.Item label="More than 90 min" value="500" />
              </Picker>
            </View>
          </View>
        )}

        {Platform.OS === "ios" && (
          <View style={{ marginLeft: 10 }}>
            <Text
              style={{
                fontSize: 15,
                marginTop: 15,
                color: "#5A5A5A",
                marginBottom: 15,
              }}
            >
              Duration
            </Text>
            <TouchableOpacity
              onPress={() => showDurationActionSheet()}
              style={{
                borderColor: "#D9D9D9",
                borderWidth: 1,
                borderRadius: 5,
                paddingHorizontal: 10,
                marginBottom: 20,
                height: 50,
                justifyContent: "center",
              }}
            >
              <Text style={{}}>{duration || "Select Duration"}</Text>
            </TouchableOpacity>
          </View>
        )}
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
      </View>
      <View
        style={{
          alignItems: "center",
        }}
      >
        <TouchableOpacity
          onPress={handleSelectSchedule}
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
          {isLoading ? (
            <ActivityIndicator color="#FFFFFF" />
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
      </View>
      {/* Toaster Message */}
      {toastMessage !== "" && (
        <View
          style={{
            position: "absolute",
            bottom: 100,
            left: 0,
            right: 0,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <View
            style={{
              backgroundColor: "#4CAF50",
              padding: 10,
              borderRadius: 5,
            }}
          >
            <Text style={{ color: "white", fontSize: 16 }}>{toastMessage}</Text>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
};

export default ScheduleSession;
