import React, { useState } from "react";
import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Platform,
  ActionSheetIOS,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import Icon from "react-native-vector-icons/FontAwesome5";

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

export default function MentorAvailability({ navigation }) {
  const [connectionType, setConnectionType] = useState("Anyone");

  // Function to show Action Sheet for selecting connection type
  const showConnectionTypeActionSheet = () => {
    const connectionTypes = ["Anyone", "Only members in your org", "Cancel"];
    ActionSheetIOS.showActionSheetWithOptions(
      {
        options: connectionTypes,
        cancelButtonIndex: connectionTypes.length - 1,
      },
      (buttonIndex) => {
        if (buttonIndex !== connectionTypes.length - 1) {
          setConnectionType(connectionTypes[buttonIndex]);
        }
      }
    );
  };

  const handleFinish = () => {
    if (
      connectionType === "Anyone" ||
      connectionType === "Only members in your org"
    ) {
      navigation.navigate("Chat");
    } else {
      alert("Please select a valid connection type");
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
        Mentor Availability
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
            fontSize: 17,
            marginTop: 10,
            paddingHorizontal: 15,
          }}
        >
          How would you like to make yourself available for the mentor
          conversation
        </Text>
        <Text
          style={{
            fontSize: 11,
            color: "#9C9C9C",
            textAlign: "left",
            marginTop: 10,
            paddingHorizontal: 15,
          }}
        >
          Set your preferences for connections and scheduling conversations
        </Text>
        <Text
          style={{
            fontWeight: "bold",
            fontSize: 24,
            marginTop: 15,
            marginBottom: 15,
            textAlign: "center",
          }}
        >
          Who can connect with you?
        </Text>
        {Platform.OS === "android" && (
          <>
            {/* Selection List with Border */}
            <View
              style={{
                width: "90%",
                borderRadius: 20,
                marginTop: 5,
                marginBottom: 20,
                marginHorizontal: 15,
                borderWidth: 1,
                borderColor: "#D9D9D9",
                overflow: "hidden",
              }}
            >
              <Picker
                selectedValue={connectionType}
                onValueChange={(itemValue) => setConnectionType(itemValue)}
                style={{
                  height: 50,
                  justifyContent: "space-between",
                }}
                mode="dropdown"
              >
                <Picker.Item label="Anyone" value="Anyone" />
                <Picker.Item
                  label="Only members in your org"
                  value="Only members in your org"
                />
              </Picker>
            </View>
          </>
        )}
        {Platform.OS === "ios" && (
          <>
            <TouchableOpacity
              onPress={() => showConnectionTypeActionSheet()}
              style={{
                backgroundColor: "#F1F1F3",
                width: "90%",
                height: 50,
                borderRadius: 20,
                marginTop: 5,
                marginBottom: 20,
                marginHorizontal: 15,
                borderColor: "#D9D9D9",
                borderWidth: 1,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Text
                style={{
                  marginLeft: 10,
                  fontSize: 16,
                }}
              >
                {connectionType}
              </Text>
            </TouchableOpacity>
          </>
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
        <NavigationLine active={true} />
      </View>
      <TouchableOpacity
        onPress={handleFinish}
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
        <Text style={{ color: "#fff", fontSize: 24, fontWeight: "bold" }}>
          Finish
        </Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}
