import {
  View,
  Text,
  SafeAreaView,
  TextInput,
  ScrollView,
  Modal,
  TouchableOpacity,
  Keyboard,
  TouchableWithoutFeedback,
  Alert,
  ActivityIndicator,
  ActionSheetIOS,
  Platform,
} from "react-native";
import React, { useState, useEffect, useContext } from "react";
import Icon from "react-native-vector-icons/FontAwesome5";
import { Picker } from "@react-native-picker/picker";
import { Dropdown } from "react-native-element-dropdown";
import AsyncStorage from "@react-native-async-storage/async-storage";
import jwt_decode from "jwt-decode";
import axios from "axios";
import { UserType } from "../UserContext";

const API_KEY = "SWhsTnlyUnI3TjFRcDV1ZE1XVFFoNlIzZ3NMTkcwaUtsZGNZNTdBNQ==";
const BASE_URL = "https://api.countrystatecity.in/v1";
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

export default function Welcome({ navigation }) {
  // Countries/States/Cities
  const [countryData, setCountryData] = useState([]);
  const [stateData, setStateData] = useState([]);
  const [cityData, setCityData] = useState([]);
  const [country, setCountry] = useState(null);
  const [state, setState] = useState(null);
  const [city, setCity] = useState(null);
  const [countryName, setCountryName] = useState(null);
  const [stateName, setStateName] = useState(null);
  const [cityName, setCityName] = useState(null);
  const [isFocus, setIsFocus] = useState(false);
  const { userId, setUserId } = useContext(UserType);
  const [loading, setLoading] = useState(false);
  const [lastInputTime, setLastInputTime] = useState(null);

  useEffect(() => {
    var config = {
      method: "get",
      url: `${BASE_URL}/countries`,
      headers: {
        "X-CSCAPI-KEY": API_KEY,
      },
    };

    axios(config)
      .then((response) => {
        var count = Object.keys(response.data).length;
        let countryArray = [];
        for (var i = 0; i < count; i++) {
          countryArray.push({
            value: response.data[i].iso2,
            label: response.data[i].name,
          });
        }
        setCountryData(countryArray);
      })
      .catch((error) => {
        console.log(error);
      });
  }, []);

  const handleState = (countryCode) => {
    var config = {
      method: "get",
      url: `${BASE_URL}/countries/${countryCode}/states`,
      headers: {
        "X-CSCAPI-KEY": API_KEY,
      },
    };

    axios(config)
      .then(function (response) {
        var count = Object.keys(response.data).length;
        let stateArray = [];
        for (var i = 0; i < count; i++) {
          stateArray.push({
            value: response.data[i].iso2,
            label: response.data[i].name,
          });
        }
        setStateData(stateArray);
      })
      .catch(function (error) {
        console.log(error);
      });
  };

  const handleCity = (countryCode, stateCode) => {
    var config = {
      method: "get",
      url: `${BASE_URL}/countries/${countryCode}/states/${stateCode}/cities`,
      headers: {
        "X-CSCAPI-KEY": API_KEY,
      },
    };

    axios(config)
      .then(function (response) {
        var count = Object.keys(response.data).length;
        let cityArray = [];
        for (var i = 0; i < count; i++) {
          cityArray.push({
            value: response.data[i].id,
            label: response.data[i].name,
          });
        }
        setCityData(cityArray);
      })
      .catch(function (error) {
        console.log(error);
      });
  };

  // Others
  const [selectedGender, setSelectedGender] = useState("");
  const [selectedRole, setSelectedRole] = useState(null);
  const [selectedParticipation, setSelectedParticipation] = useState(null);
  const [selectedRace, setSelectedRace] = useState("");
  const [FirstName, setFirstName] = useState("");
  const [LastName, setLastName] = useState("");
  const [Pronouns, setPronouns] = useState("");

  // Function to open ActionSheetIOS for Pronouns selection
  const showPronounsOptions = () => {
    const pronounsOptions = ["She/Her", "He/Him", "They/Them", "Cancel"];
    ActionSheetIOS.showActionSheetWithOptions(
      {
        options: pronounsOptions,
        cancelButtonIndex: pronounsOptions.length - 1,
      },
      (buttonIndex) => {
        if (buttonIndex !== pronounsOptions.length - 1) {
          handlePronounsChange(pronounsOptions[buttonIndex]);
        }
      }
    );
  };
  // Function to handle Pronouns change
  const handlePronounsChange = (value) => {
    setPronouns(value);
  };
  // Function to open ActionSheetIOS for Gender selection
  const showGenderOptions = () => {
    const genderOptions = ["Male", "Female", "Rather not say", "Cancel"];
    ActionSheetIOS.showActionSheetWithOptions(
      {
        options: genderOptions,
        cancelButtonIndex: genderOptions.length - 1,
      },
      (buttonIndex) => {
        if (buttonIndex !== genderOptions.length - 1) {
          handleGenderChange(genderOptions[buttonIndex]);
        }
      }
    );
  };

  // Function to open ActionSheetIOS for Race/Ethnicity selection
  const showRaceOptions = () => {
    const raceOptions = [
      "American Indian or Alaskan Native",
      "Hispanic or Latino origin of any race",
      "Asian",
      "Native Hawaiian or Other Pacific Islander",
      "Black or African American",
      "White",
      "Unknown",
      "Prefer not to state",
      "Cancel",
    ];
    ActionSheetIOS.showActionSheetWithOptions(
      {
        options: raceOptions,
        cancelButtonIndex: raceOptions.length - 1,
      },
      (buttonIndex) => {
        if (buttonIndex !== raceOptions.length - 1) {
          handleRaceChange(raceOptions[buttonIndex]);
        }
      }
    );
  };

  const handleRaceChange = (race) => {
    setSelectedRace(race);
  };
  const handleGenderChange = (gender) => {
    setSelectedGender(gender);
  };

  const handleRoleSelection = (role) => {
    setSelectedRole(role);
  };

  const handleParticipationSelection = (participation) => {
    setSelectedParticipation(participation);
  };
  // Set First name and last name onchange
  const handleFirstNameChange = (text) => {
    setFirstName(text);
  };
  const handleLastNameChange = (text) => {
    setLastName(text);
  };
  // Popup
  const [isPopupVisible, setPopupVisible] = useState(false);

  const togglePopup = () => {
    setPopupVisible(!isPopupVisible);
  };

  // Handle Next button with validation
  const handleNext = async () => {
    // Fetch user id first
    console.log(userId);
    // Name Validation
    if (!FirstName || !LastName) {
      Alert.alert(
        "Error",
        "Please enter your first and last name",
        [
          {
            text: "OK",
            style: "cancel",
          },
        ],
        { cancelable: false }
      );
      return;
    }
    // Pronouns Validation

    // Gender Validation
    if (!selectedGender || selectedGender === "Select Gender") {
      Alert.alert("Error", "Please select your gender", [{ text: "OK" }]);
      return;
    }

    // Validate Race
    if (!selectedRace || selectedRace === "Enter your race") {
      Alert.alert("Error", "Please select your race/ethnicity", [
        { text: "OK" },
      ]);
      return;
    }
    // Validate Country
    if (!country || country === "Select Country") {
      Alert.alert("Error", "Please select your country", [{ text: "OK" }]);
      return;
    }
    // Validate State
    if (!state || state === "Select State") {
      Alert.alert("Error", "Please select your state", [{ text: "OK" }]);
      return;
    }

    // Validate City
    if (!city || city === "Select City") {
      Alert.alert("Error", "Please select your city", [{ text: "OK" }]);
      return;
    }

    // Validate Role
    if (!selectedRole) {
      Alert.alert("Error", "Please select your role", [{ text: "OK" }]);
      return;
    }
    // Validate Participation
    if (!selectedParticipation) {
      Alert.alert("Error", "Please select your participation preference", [
        { text: "OK" },
      ]);
      return;
    }
    setLoading(true);
    // Prepare user data
    const userData = {
      userId: userId,
      First_Name: FirstName,
      Last_Name: LastName,
      Pronoun: Pronouns,
      Gender: selectedGender,
      Race: selectedRace,
      Country: countryName,
      State: stateName,
      City: cityName,
      Role: selectedRole,
      Student: selectedParticipation === "findMentor",
      Mentor: selectedParticipation === "mentorOther",
    };
    try {
      // Send user data to backend for first API call
      const response1 = await axios.post(
        `https://mentorship-backends-rahul-mistrys-projects.vercel.app/onboarding/v1`,
        userData
      );

      // Check response and proceed if successful
      if (response1.status === 200) {
        console.log("Successfully sent user data to onboarded/v1 API");
        // Send user data to backend for second API call
        const response2 = await axios.post(
          `https://mentorship-backends-rahul-mistrys-projects.vercel.app/onboarded/${userId}`
        );

        // Check response and navigate if successful
        if (response2.status === 200) {
          console.log("Successfully set onboarded status for user");
          navigation.navigate("Education");
        } else {
          Alert.alert("Error", "Failed to set onboarded status for user");
        }
      } else {
        Alert.alert("Error", "Failed to onboard user");
      }
    } catch (error) {
      console.error("Error onboarding user:", error);
      Alert.alert("Error", "Failed to onboard user");
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (text, dropdown) => {
    if (text.length >= 3) {
      // Minimum characters for search to trigger
      setLastInputTime(Date.now()); // Update last input time
    } else {
      // Clear data if search falls below minimum characters
    }
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (Date.now() - lastInputTime > 500) {
        // Check for inactivity after 200ms
        Keyboard.dismiss();
      }
    }, 500); // Schedule timeout for 200ms

    return () => clearTimeout(timeoutId); // Clear timeout on unmount
  }, [lastInputTime]);

  return (
    <SafeAreaView
      style={{
        flex: 1,
        alignItems: "center",
        marginTop: 40,
      }}
    >
      <Text
        style={{
          fontWeight: "bold",
          fontSize: 20,
          marginBottom: 5,
        }}
      >
        Welcome to MentoRship
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
          Discover personalized mentorship opportunities tailored to your unique
          needs and aspirations by providing us with basic information about
          yourself.
        </Text>
        <TouchableOpacity onPress={togglePopup}>
          <Text
            style={{
              fontSize: 11,
              color: "#9C9C9C",
              textAlign: "left",
              marginTop: 10,
              paddingHorizontal: 15,
              textDecorationLine: "underline",
            }}
          >
            Thought you already completed these steps?
          </Text>
        </TouchableOpacity>

        <Modal
          animationType="slide"
          transparent={true}
          visible={isPopupVisible}
          onRequestClose={togglePopup}
        >
          <TouchableWithoutFeedback onPress={togglePopup}>
            <View
              style={{
                flex: 1,
                justifyContent: "center",
                alignItems: "center",
                backgroundColor: "rgba(0, 0, 0, 0.5)",
              }}
            >
              <TouchableWithoutFeedback onPress={() => {}}>
                <View
                  style={{
                    backgroundColor: "#fff",
                    padding: 20,
                    borderRadius: 10,
                    width: "80%",
                  }}
                >
                  <Text
                    style={{
                      fontSize: 16,
                      marginBottom: 20,
                    }}
                  >
                    If you have already completed it, please proceed to Login.
                  </Text>
                  <TouchableOpacity
                    onPress={() => {
                      togglePopup();
                      navigation.navigate("Login");
                    }}
                    style={{
                      backgroundColor: "#09A1F6",
                      padding: 10,
                      borderRadius: 10,
                      alignItems: "center",
                    }}
                  >
                    <Text
                      style={{
                        color: "#fff",
                        fontSize: 16,
                        fontWeight: "bold",
                      }}
                    >
                      Login
                    </Text>
                  </TouchableOpacity>
                </View>
              </TouchableWithoutFeedback>
            </View>
          </TouchableWithoutFeedback>
        </Modal>

        {/* Name */}
        <View
          style={{
            paddingHorizontal: 15,
          }}
        >
          <Text style={{ marginTop: 15, fontWeight: 300 }}>First Name *</Text>
          <TextInput
            style={{
              backgroundColor: "#F1F1F3",
              width: "100%",
              height: 50,
              borderRadius: 20,
              marginTop: 15,
              paddingHorizontal: 20,
              borderColor: "#D9D9D9",
              borderWidth: 1,
            }}
            value={FirstName}
            onChangeText={(text) => handleFirstNameChange(text)}
          ></TextInput>
          <Text style={{ marginTop: 15, fontWeight: 300 }}>Last Name *</Text>
          <TextInput
            style={{
              backgroundColor: "#F1F1F3",
              width: "100%",
              height: 50,
              borderRadius: 20,
              marginTop: 15,
              paddingHorizontal: 20,
              borderColor: "#D9D9D9",
              borderWidth: 1,
            }}
            value={LastName}
            onChangeText={(text) => handleLastNameChange(text)}
          ></TextInput>
          {Platform.OS === "ios" && (
            <>
              <Text style={{ marginTop: 15, fontWeight: 300 }}>Pronouns *</Text>
              <TouchableOpacity
                onPress={showPronounsOptions}
                style={{
                  backgroundColor: "#F1F1F3",
                  width: "100%",
                  height: 50,
                  borderRadius: 20,
                  marginTop: 15,
                  paddingHorizontal: 20,
                  borderColor: "#D9D9D9",
                  justifyContent: "center",
                  borderWidth: 1,
                }}
              >
                <Text>{Pronouns || "Select Pronouns"}</Text>
              </TouchableOpacity>
            </>
          )}
          {Platform.OS === "android" && (
            <>
              <Text style={{ marginTop: 15, fontWeight: 300 }}>Pronouns *</Text>
              <View
                style={{
                  backgroundColor: "#F1F1F3",
                  width: "100%",
                  height: 50,
                  borderRadius: 20,
                  marginTop: 15,
                  paddingHorizontal: 5,
                  borderColor: "#D9D9D9",
                  justifyContent: "center",
                  borderWidth: 1,
                }}
              >
                <Picker
                  selectedValue={Pronouns}
                  onValueChange={(itemValue) => handlePronounsChange(itemValue)}
                  style={{ height: 50, width: "100%" }}
                  mode="dropdown"
                >
                  <Picker.Item label="Select Pronouns" value="" />
                  <Picker.Item label="She/Her" value="She/Her" />
                  <Picker.Item label="He/Him" value="He/Him" />
                  <Picker.Item label="They/Them" value="They/Them" />
                </Picker>
              </View>
            </>
          )}
          {Platform.OS === "ios" && (
            <>
              <Text style={{ marginTop: 15, fontWeight: 300 }}>Gender *</Text>
              <TouchableOpacity
                onPress={showGenderOptions}
                style={{
                  backgroundColor: "#F1F1F3",
                  width: "100%",
                  height: 50,
                  borderRadius: 20,
                  marginTop: 15,
                  paddingHorizontal: 5,
                  borderColor: "#D9D9D9",
                  justifyContent: "center",
                  borderWidth: 1,
                }}
              >
                <Text style={{ marginLeft: 10 }}>
                  {selectedGender || "Select Gender"}
                </Text>
              </TouchableOpacity>
              <Text style={{ marginTop: 15, fontWeight: 300 }}>
                Race/Ethnicity *
              </Text>
              <TouchableOpacity
                onPress={showRaceOptions}
                style={{
                  backgroundColor: "#F1F1F3",
                  width: "100%",
                  height: 50,
                  borderRadius: 20,
                  marginTop: 15,
                  paddingHorizontal: 5,
                  borderColor: "#D9D9D9",
                  justifyContent: "center",
                  borderWidth: 1,
                }}
              >
                <Text style={{ marginLeft: 10 }}>
                  {selectedRace || "Enter your race"}
                </Text>
              </TouchableOpacity>
            </>
          )}
          {Platform.OS === "android" && (
            <>
              <Text style={{ marginTop: 15, fontWeight: 300 }}>Gender *</Text>
              <View
                style={{
                  backgroundColor: "#F1F1F3",
                  width: "100%",
                  height: 50,
                  borderRadius: 20,
                  marginTop: 15,
                  paddingHorizontal: 5,
                  borderColor: "#D9D9D9",
                  justifyContent: "center",
                  borderWidth: 1,
                }}
              >
                <Picker
                  selectedValue={selectedGender}
                  onValueChange={(itemValue) => handleGenderChange(itemValue)}
                  style={{ height: 50, width: "100%" }}
                  mode="dropdown"
                >
                  <Picker.Item label="Select Gender" value="" />
                  <Picker.Item label="Male" value="male" />
                  <Picker.Item label="Female" value="female" />
                  <Picker.Item label="Rather not say" value="notSay" />
                </Picker>
              </View>
              <Text style={{ marginTop: 15, fontWeight: 300 }}>
                Race/Ethnicity *
              </Text>
              <View
                style={{
                  backgroundColor: "#F1F1F3",
                  width: "100%",
                  height: 50,
                  borderRadius: 20,
                  marginTop: 15,
                  paddingHorizontal: 5,
                  borderColor: "#D9D9D9",
                  justifyContent: "center",
                  borderWidth: 1,
                }}
              >
                <Picker
                  selectedValue={selectedRace}
                  onValueChange={(itemValue) => handleRaceChange(itemValue)}
                  style={{ height: 50, width: "100%" }}
                  mode="dropdown"
                >
                  <Picker.Item label="Enter your race" value="" />
                  <Picker.Item
                    label="American Indian or Alaskan Native"
                    value="americanIndian"
                  />
                  <Picker.Item
                    label="Hispanic or Latino origin of any race"
                    value="hispanicLatino"
                  />
                  <Picker.Item label="Asian" value="asian" />
                  <Picker.Item
                    label="Native Hawaiian or Other Pacific Islander"
                    value="pacificIslander"
                  />
                  <Picker.Item
                    label="Black or African American"
                    value="africanAmerican"
                  />
                  <Picker.Item label="White" value="white" />
                  <Picker.Item label="Unknown" value="unknown" />
                  <Picker.Item label="Prefer not to state" value="notToState" />
                </Picker>
              </View>
            </>
          )}

          <Text style={{ marginTop: 15, fontWeight: 300 }}>Country *</Text>
          <View
            style={{
              backgroundColor: "#F1F1F3",
              width: "100%",
              height: 50,
              borderRadius: 20,
              marginTop: 15,
              paddingHorizontal: 20,
              borderColor: "#D9D9D9",
              justifyContent: "center",
              borderWidth: 1,
            }}
          >
            <Dropdown
              placeholderStyle={{
                fontSize: 16,
              }}
              selectedTextStyle={{
                fontSize: 16,
              }}
              inputSearchStyle={{
                height: 40,
                fontSize: 16,
              }}
              iconStyle={{
                width: 20,
                height: 20,
              }}
              data={countryData}
              search
              maxHeight={300}
              labelField="label"
              valueField="value"
              placeholder={!isFocus ? "Select country" : "..."}
              searchPlaceholder="Search..."
              value={country}
              onFocus={() => setIsFocus(true)}
              onBlur={() => setIsFocus(false)}
              onChange={(item) => {
                setCountry(item.value);
                handleState(item.value);
                setCountryName(item.label);
                setIsFocus(false);
                Keyboard.dismiss();
              }}
              onChangeText={(text) => handleSearchChange(text, this)}
            />
          </View>
          <Text style={{ marginTop: 15, fontWeight: 300 }}>State *</Text>
          <View
            style={{
              backgroundColor: "#F1F1F3",
              width: "100%",
              height: 50,
              borderRadius: 20,
              marginTop: 15,
              paddingHorizontal: 20,
              borderColor: "#D9D9D9",
              justifyContent: "center",
              borderWidth: 1,
            }}
          >
            <Dropdown
              placeholderStyle={{
                fontSize: 16,
              }}
              selectedTextStyle={{
                fontSize: 16,
              }}
              inputSearchStyle={{
                height: 40,
                fontSize: 16,
              }}
              iconStyle={{
                width: 20,
                height: 20,
              }}
              data={stateData}
              search
              maxHeight={300}
              labelField="label"
              valueField="value"
              placeholder={!isFocus ? "Select state" : "..."}
              searchPlaceholder="Search..."
              value={state}
              onFocus={() => setIsFocus(true)}
              onBlur={() => setIsFocus(false)}
              onChange={(item) => {
                setState(item.value);
                handleCity(country, item.value);
                setStateName(item.label);
                setIsFocus(false);
                Keyboard.dismiss();
              }}
              onChangeText={(text) => handleSearchChange(text, this)}
            />
          </View>
          <Text style={{ marginTop: 15, fontWeight: 300 }}>City *</Text>
          <View
            style={{
              backgroundColor: "#F1F1F3",
              width: "100%",
              height: 50,
              borderRadius: 20,
              marginTop: 15,
              paddingHorizontal: 20,
              borderColor: "#D9D9D9",
              justifyContent: "center",
              borderWidth: 1,
            }}
          >
            <Dropdown
              placeholderStyle={{
                fontSize: 16,
              }}
              selectedTextStyle={{
                fontSize: 16,
              }}
              inputSearchStyle={{
                height: 40,
                fontSize: 16,
              }}
              iconStyle={{
                width: 20,
                height: 20,
              }}
              data={cityData}
              search
              maxHeight={300}
              labelField="label"
              valueField="value"
              placeholder={!isFocus ? "Select city" : "..."}
              searchPlaceholder="Search..."
              value={city}
              onFocus={() => setIsFocus(true)}
              onBlur={() => setIsFocus(false)}
              onChange={(item) => {
                setCity(item.value);
                setCityName(item.label);
                setIsFocus(false);
                Keyboard.dismiss();
              }}
              onChangeText={(text) => handleSearchChange(text, this)}
            />
          </View>
        </View>
        <Text
          style={{
            fontWeight: "600",
            fontSize: 14,
            textAlign: "center",
            marginTop: 10,
          }}
        >
          What is your primary role?
        </Text>
        <View
          style={{
            flex: 1,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            gap: 10,
            marginTop: 10,
          }}
        >
          <TouchableOpacity
            onPress={() => handleRoleSelection("student")}
            style={{
              width: 150,
              height: 60,
              backgroundColor: "#fff",
              borderRadius: 10,
              justifyContent: "center",
              alignItems: "center",
              borderColor: selectedRole === "student" ? "#09A1F6" : "#D9D9D9",
              borderWidth: 0.7,
              shadowColor: "#000",
              shadowOffset: {
                width: 0,
                height: 2,
              },
              shadowOpacity: 0.25,
              shadowRadius: 3.84,
              elevation: 5,
            }}
          >
            <Icon name="book" size={20} color="#000" />
            <Text style={{ color: "#000" }}>Student</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => handleRoleSelection("professional")}
            style={{
              width: 150,
              height: 60,
              backgroundColor: "#fff",
              borderRadius: 10,
              justifyContent: "center",
              alignItems: "center",
              borderColor:
                selectedRole === "professional" ? "#09A1F6" : "#D9D9D9",
              borderWidth: 0.7,
              shadowColor: "#000",
              shadowOffset: {
                width: 0,
                height: 2,
              },
              shadowOpacity: 0.25,
              shadowRadius: 3.84,
              elevation: 5,
            }}
          >
            <Icon name="briefcase" size={20} color="#000" />
            <Text
              style={{
                color: "#000",
              }}
            >
              Working professional
            </Text>
          </TouchableOpacity>
        </View>

        <Text
          style={{
            fontWeight: "bold",
            fontSize: 14,
            textAlign: "center",
            marginTop: 10,
          }}
        >
          How do you want to participate in the MentoRship community?
        </Text>
        <View
          style={{
            flex: 1,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            gap: 10,
            marginTop: 10,
          }}
        >
          <TouchableOpacity
            onPress={() => handleParticipationSelection("findMentor")}
            style={{
              width: 150,
              height: 60,
              backgroundColor:
                selectedParticipation === "findMentor" ? "#09A1F6" : "#fff",
              textAlign: "center",
              padding: 5,
              borderRadius: 10,
              justifyContent: "center",
              marginBottom: 10,
              shadowColor: "#000",
              shadowOffset: {
                width: 0,
                height: 2,
              },
              shadowOpacity: 0.25,
              shadowRadius: 3.84,
              elevation: 5,
            }}
          >
            <Text
              style={{
                color: selectedParticipation === "findMentor" ? "#fff" : "#000",
                textAlign: "center",
              }}
            >
              I want to find a mentor
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => handleParticipationSelection("mentorOther")}
            style={{
              width: 150,
              height: 60,
              backgroundColor:
                selectedParticipation === "mentorOther" ? "#09A1F6" : "#fff",
              textAlign: "center",
              padding: 5,
              borderRadius: 10,
              justifyContent: "center",
              shadowColor: "#000",
              marginBottom: 10,
              shadowOffset: {
                width: 0,
                height: 2,
              },
              shadowOpacity: 0.25,
              shadowRadius: 3.84,
              elevation: 5,
            }}
          >
            <Text
              style={{
                textAlign: "center",
                color:
                  selectedParticipation === "mentorOther" ? "#fff" : "#000",
              }}
            >
              I want to mentor others
            </Text>
          </TouchableOpacity>
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
