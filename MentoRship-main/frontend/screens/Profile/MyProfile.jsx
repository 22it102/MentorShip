import {
  View,
  Text,
  TextInput,
  ScrollView,
  Image,
  Platform,
  ActivityIndicator,
  ActionSheetIOS,
} from "react-native";
import React, { useContext, useEffect } from "react";
import { TouchableOpacity } from "react-native";
import { useState } from "react";
import Icon from "react-native-vector-icons/FontAwesome5";
import { MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { UserType } from "../../UserContext";
import { Dropdown } from "react-native-element-dropdown";
import axios from "axios";
import { Picker } from "@react-native-picker/picker";
const API_KEY = "SWhsTnlyUnI3TjFRcDV1ZE1XVFFoNlIzZ3NMTkcwaUtsZGNZNTdBNQ==";
const BASE_URL = "https://api.countrystatecity.in/v1";

export default function MyProfile({ navigation }) {
  const [profileData, setProfileData] = useState({
    headline: "",
    country: null,
    state: null,
    city: null,
    education: "",
    experience: "",
    gender: "",
    raceEthnicity: "",
    role: "",
    careerGoals: [],
    image: "",
    name: "",
    student: false,
    workingProfessional: false,
  });

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
          const selectedGender = genderOptions[buttonIndex];
          handleInputChange("gender", selectedGender);
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

  const { userId } = useContext(UserType);
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
  const [isLoading, setIsLoading] = useState(true);
  const [selectedParticipation, setSelectedParticipation] =
    useState("findMentor");
  const handleParticipationSelection = (participationType) => {
    setSelectedParticipation(participationType);
  };
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
  useEffect(() => {
    fetchProfileData();
  }, []);
  const fetchProfileData = async () => {
    try {
      const response = await fetch(
        `https://mentorship-backends-rahul-mistrys-projects.vercel.app/user-details/${userId}`
      );
      if (response.ok) {
        const data = await response.json();
        setProfileData({
          ...profileData,
          headline: data.headline,
          country: data.country,
          state: data.state,
          city: data.city,
          education: data.education,
          experience: data.experience,
          gender: data.gender,
          raceEthnicity: data.raceEthnicity,
          role: data.role,
          careerGoals: data.careerGoals,
          image: data.image,
          name: data.name,
          student: data.student,
          workingProfessional: data.workingProfessional,
        });
        // Set country, state, and city in state variables
        setCountry(data.country);
        setState(data.state);
        setCity(data.city);
        if (data.country) {
          handleState(data.country);
        }

        // Fetch city data based on country and state
        if (data.country && data.state) {
          handleCity(data.country, data.state);
        }
      } else {
        console.error("Failed to fetch profile data:", response.status);
        // Handle error
      }
    } catch (error) {
      console.error("Error fetching profile data:", error);
      // Handle error
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setProfileData({ ...profileData, [field]: value });
  };

  const handleRaceChange = (raceEthnicity) => {
    setProfileData({ ...profileData, raceEthnicity: raceEthnicity });
  };

  return (
    <LinearGradient
      colors={["#000000", "#007CB0"]}
      style={{ flex: 1 }}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
      locations={[0.3, 1]}
    >
      <View
        style={{
          flex: 1,
          paddingBottom: 0,
        }}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            paddingHorizontal: 20,
            marginTop: Platform.OS === "ios" ? 55 : 45,
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
            }}
          >
            My Profile
          </Text>
        </View>

        <View
          style={{
            flex: 1,
            borderTopStartRadius: 50,
            borderTopEndRadius: 50,
            backgroundColor: "#FFFFFF",
            marginTop: 20,
            paddingBottom: 50,
          }}
        >
          {isLoading ? (
            <View
              style={{
                flex: 1,
                justifyContent: "center",
                alignItems: "center",
                backgroundColor: "#FFFFFF",
              }}
            >
              <ActivityIndicator size="large" color="#000" />
              <Text style={{ marginTop: 10, fontSize: 16 }}>
                Please wait...
              </Text>
            </View>
          ) : (
            <ScrollView
              vertical={true}
              style={{
                flex: 1,
                marginRight: -5,
                marginBottom: -50,
                marginTop: 10,
              }}
            >
              <View>
                <Text
                  style={{
                    marginTop: 20,
                    fontSize: 20,
                    marginLeft: 30,
                    fontWeight: "bold",
                  }}
                >
                  Basic Details
                </Text>
              </View>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginTop: 10,
                  marginLeft: 20,
                }}
              >
                <View style={{ position: "relative" }}>
                  {profileData.image ? (
                    <Image
                      source={{ uri: profileData.image }}
                      style={{ width: 70, height: 70, borderRadius: 75 }}
                    />
                  ) : (
                    <View
                      style={{
                        width: 70,
                        height: 70,
                        borderRadius: 75,
                        backgroundColor: "#CCCCCC",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Text>No Image</Text>
                    </View>
                  )}
                  <TouchableOpacity
                    style={{
                      position: "absolute",
                      bottom: -5,
                      left: 50,
                      padding: 4,
                    }}
                    onPress={() => console.log("Update photo")}
                  >
                    <Icon name="edit" size={20} color="black" />
                  </TouchableOpacity>
                </View>
                <TextInput
                  style={{
                    backgroundColor: "#FFFFFF",
                    width: "70%",
                    height: 50,
                    borderRadius: 20,
                    marginTop: 15,
                    paddingHorizontal: 20,
                    borderColor: "#D9D9D9",
                    borderWidth: 1,
                    marginHorizontal: 20,
                  }}
                  value={profileData.name}
                  onChangeText={(text) => handleInputChange("name", text)}
                  placeholder="Name"
                  placeholderTextColor="#A9A9A9"
                />
              </View>
              <Text
                style={{
                  marginTop: 10,
                  marginLeft: 30,
                }}
              >
                Headline
              </Text>
              <TextInput
                style={{
                  backgroundColor: "#FFFFFF",
                  width: "90%",
                  height: 50,
                  borderRadius: 20,
                  marginTop: 15,
                  paddingHorizontal: 20,
                  borderColor: "#D9D9D9",
                  borderWidth: 1,
                  marginHorizontal: 20,
                }}
                value={profileData.headline}
                onChangeText={(text) => handleInputChange("headline", text)}
              />
              <View>
                <Text style={{ marginTop: 20, marginHorizontal: 30 }}>
                  Country *
                </Text>
                <View
                  style={{
                    backgroundColor: "#FFF",
                    width: "90%",
                    height: 50,
                    borderRadius: 20,
                    marginTop: 15,
                    paddingHorizontal: 20,
                    borderColor: "#D9D9D9",
                    justifyContent: "center",
                    borderWidth: 1,
                    marginHorizontal: 20,
                  }}
                >
                  <Dropdown
                    placeholderStyle={{ fontSize: 16 }}
                    selectedTextStyle={{ fontSize: 16 }}
                    inputSearchStyle={{ height: 40, fontSize: 16 }}
                    iconStyle={{ width: 20, height: 20 }}
                    data={countryData}
                    search
                    maxHeight={300}
                    labelField="label"
                    valueField="value"
                    placeholder={country}
                    searchPlaceholder="Search..."
                    value={country}
                    onFocus={() => setIsFocus(true)}
                    onBlur={() => setIsFocus(true)}
                    onChange={(item) => {
                      setCountry(profileData.country);
                      setState(profileData.state);
                      setCity(profileData.city);
                      handleState(item.value);
                    }}
                  />
                </View>
                {/* State dropdown */}
                <Text style={{ marginTop: 15, marginLeft: 30 }}>State *</Text>
                <View
                  style={{
                    backgroundColor: "#FFF",
                    width: "90%",
                    height: 50,
                    borderRadius: 20,
                    marginTop: 15,
                    paddingHorizontal: 20,
                    borderColor: "#D9D9D9",
                    justifyContent: "center",
                    borderWidth: 1,
                    marginHorizontal: 20,
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
                    placeholder={state}
                    searchPlaceholder="Search..."
                    value={state}
                    onFocus={() => setIsFocus(true)}
                    onBlur={() => setIsFocus(false)}
                    onChange={(item) => {
                      setState(profileData.state);
                      handleCity(country, profileData.country);
                      setStateName(profileData.state);
                      setIsFocus(true);
                      Keyboard.dismiss();
                    }}
                  />
                </View>
                <Text style={{ marginTop: 15, marginLeft: 30 }}>City *</Text>
                <View
                  style={{
                    backgroundColor: "#FFF",
                    width: "90%",
                    height: 50,
                    borderRadius: 20,
                    marginTop: 15,
                    paddingHorizontal: 20,
                    borderColor: "#D9D9D9",
                    justifyContent: "center",
                    borderWidth: 1,
                    marginHorizontal: 20,
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
                    placeholder={city}
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
                  />
                </View>
              </View>
              <Text
                style={{
                  marginTop: 20,
                  fontSize: 20,
                  marginLeft: 30,
                  fontWeight: "bold",
                }}
              >
                Personal Details
              </Text>
              {Platform.OS === "android" && (
                <>
                  <Text
                    style={{
                      marginTop: 15,
                      fontWeight: 300,
                      marginHorizontal: 30,
                    }}
                  >
                    Gender *
                  </Text>
                  <View
                    style={{
                      backgroundColor: "#FFF",
                      width: "90%",
                      height: 50,
                      borderRadius: 20,
                      marginTop: 15,
                      paddingHorizontal: 10,
                      borderColor: "#D9D9D9",
                      justifyContent: "center",
                      borderWidth: 1,
                      marginHorizontal: 20,
                    }}
                  >
                    <Picker
                      selectedValue={profileData.gender}
                      onValueChange={(itemValue) =>
                        handleInputChange("gender", itemValue)
                      } // Handle gender change
                      style={{ height: 50, width: "100%" }}
                      mode="dropdown"
                    >
                      <Picker.Item label="Select Gender" value="" />
                      <Picker.Item label="Male" value="male" />
                      <Picker.Item label="Female" value="female" />
                      <Picker.Item label="Rather not say" value="notSay" />
                    </Picker>
                  </View>
                </>
              )}
              {Platform.OS === "ios" && (
                <>
                  <Text
                    style={{
                      marginTop: 15,
                      fontWeight: 300,
                      marginHorizontal: 30,
                    }}
                  >
                    Gender *
                  </Text>
                  <TouchableOpacity onPress={showGenderOptions}>
                    <View
                      style={{
                        backgroundColor: "#FFF",
                        width: "90%",
                        height: 50,
                        borderRadius: 20,
                        marginTop: 15,
                        paddingHorizontal: 10,
                        borderColor: "#D9D9D9",
                        justifyContent: "center",
                        borderWidth: 1,
                        marginHorizontal: 20,
                      }}
                    >
                      <Text
                        style={{
                          paddingHorizontal: 10,
                        }}
                      >
                        {profileData.gender || "Select Gender"}
                      </Text>
                    </View>
                  </TouchableOpacity>
                </>
              )}
              {Platform.OS === "android" && (
                <>
                  <Text
                    style={{
                      marginTop: 15,
                      fontWeight: 300,
                      marginHorizontal: 30,
                    }}
                  >
                    Race/Ethnicity *
                  </Text>

                  <View
                    style={{
                      backgroundColor: "#FFF",
                      width: "90%",
                      height: 50,
                      borderRadius: 20,
                      marginTop: 15,
                      paddingHorizontal: 10,
                      borderColor: "#D9D9D9",
                      justifyContent: "center",
                      borderWidth: 1,
                      marginHorizontal: 20,
                    }}
                  >
                    <Picker
                      selectedValue={profileData.raceEthnicity} // Populate with fetched race/ethnicity data
                      onValueChange={(itemValue) =>
                        handleInputChange("raceEthnicity", itemValue)
                      } // Handle race/ethnicity change
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
                      <Picker.Item
                        label="Prefer not to state"
                        value="notToState"
                      />
                    </Picker>
                  </View>
                </>
              )}
              {Platform.OS === "ios" && (
                <>
                  <Text
                    style={{
                      marginTop: 15,
                      fontWeight: 300,
                      marginHorizontal: 30,
                    }}
                  >
                    Race/Ethnicity *
                  </Text>
                  <TouchableOpacity onPress={showRaceOptions}>
                    <View
                      style={{
                        backgroundColor: "#FFF",
                        width: "90%",
                        height: 50,
                        borderRadius: 20,
                        marginTop: 15,
                        paddingHorizontal: 10,
                        borderColor: "#D9D9D9",
                        justifyContent: "center",
                        borderWidth: 1,
                        marginHorizontal: 20,
                      }}
                    >
                      <Text
                        style={{
                          paddingHorizontal: 10,
                        }}
                      >
                        {profileData.raceEthnicity || "Select Gender"}
                      </Text>
                    </View>
                  </TouchableOpacity>
                </>
              )}
              <Text
                style={{
                  marginTop: 10,
                  fontSize: 16,
                  marginLeft: 30,
                  fontWeight: "bold",
                }}
              >
                Contact
              </Text>
              <View
                style={{
                  flexDirection: "row",
                  gap: 10,
                  alignItems: "flex-start",
                  marginLeft: 30,
                  marginTop: 10,
                }}
              >
                <TouchableOpacity>
                  <Image
                    source={require("../../assets/LinkedIn.png")}
                    style={{
                      height: 50,
                      width: 50,
                    }}
                  />
                </TouchableOpacity>
                <TouchableOpacity>
                  <Image
                    source={require("../../assets/instagram.png")}
                    style={{
                      height: 50,
                      width: 50,
                    }}
                  />
                </TouchableOpacity>
                <TouchableOpacity>
                  <Image
                    source={require("../../assets/fb.png")}
                    style={{
                      height: 50,
                      width: 50,
                    }}
                  />
                </TouchableOpacity>
                <TouchableOpacity>
                  <Image
                    source={require("../../assets/twitter.png")}
                    style={{
                      height: 50,
                      width: 50,
                    }}
                  />
                </TouchableOpacity>
              </View>
              <Text
                style={{
                  marginTop: 10,
                  fontSize: 16,
                  marginLeft: 30,
                  fontWeight: "bold",
                }}
              >
                Bio
              </Text>
              <TextInput
                style={{
                  backgroundColor: "#FFFFFF",
                  width: "87%",
                  height: 80,
                  borderRadius: 15,
                  marginTop: 15,
                  borderColor: "#D9D9D9",
                  borderWidth: 1,
                  marginHorizontal: 25,
                }}
              ></TextInput>
              <View>
                <Text
                  style={{
                    marginTop: 10,
                    fontSize: 16,
                    marginLeft: 30,
                    fontWeight: "bold",
                  }}
                >
                  Mentorship Objectives
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
                      width: 165,
                      height: 60,
                      backgroundColor:
                        selectedParticipation === "findMentor"
                          ? "#09A1F6"
                          : "#fff",
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
                        color:
                          selectedParticipation === "findMentor"
                            ? "#fff"
                            : "#000",
                        textAlign: "center",
                      }}
                    >
                      I want to find a mentor
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => handleParticipationSelection("mentorOther")}
                    style={{
                      width: 165,
                      height: 60,
                      backgroundColor:
                        selectedParticipation === "mentorOther"
                          ? "#09A1F6"
                          : "#fff",
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
                          selectedParticipation === "mentorOther"
                            ? "#fff"
                            : "#000",
                      }}
                    >
                      I want to mentor others
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              <TouchableOpacity
                style={{
                  marginTop: 10,
                  marginLeft: 30,
                }}
              >
                <Text
                  style={{
                    fontSize: 16,
                    textAlign: "left",
                    fontWeight: "bold",
                  }}
                >
                  Education Experience
                </Text>
              </TouchableOpacity>
              <View
                style={{
                  width: 300,
                  height: 1.5,
                  backgroundColor: "#D9D9D9",
                  marginTop: 15,
                  marginLeft: 30,
                }}
              ></View>
              <TouchableOpacity
                style={{
                  marginTop: 10,
                  marginLeft: 30,
                }}
              >
                <Text
                  style={{
                    fontSize: 16,
                    textAlign: "left",
                    fontWeight: "bold",
                  }}
                >
                  Areas of Interest
                </Text>
              </TouchableOpacity>
              <View
                style={{
                  width: 300,
                  height: 1.5,
                  backgroundColor: "#D9D9D9",
                  marginTop: 15,
                  marginLeft: 30,
                }}
              ></View>
              <TouchableOpacity
                style={{
                  marginTop: 10,
                  marginLeft: 30,
                }}
              >
                <Text
                  style={{
                    fontSize: 16,
                    textAlign: "left",
                    fontWeight: "bold",
                  }}
                >
                  Career Goals
                </Text>
              </TouchableOpacity>
              <View
                style={{
                  width: 300,
                  height: 1.5,
                  backgroundColor: "#D9D9D9",
                  marginTop: 15,
                  marginLeft: 30,
                }}
              ></View>
              <TouchableOpacity
                style={{
                  marginTop: 10,
                  marginLeft: 30,
                }}
              >
                <Text
                  style={{
                    fontSize: 16,
                    textAlign: "left",
                    fontWeight: "bold",
                  }}
                >
                  MentoRship Availability
                </Text>
              </TouchableOpacity>
              <Text
                style={{
                  fontSize: 16,
                  textAlign: "center",
                  marginTop: 10,
                  fontWeight: "bold",
                }}
              >
                How do you want to participate in MemtoRship Community?
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
                  style={{
                    width: 150,
                    height: 60,
                    backgroundColor: profileData.student ? "#3498DB" : "#fff", // Highlight blue if student
                    borderRadius: 10,
                    justifyContent: "center",
                    alignItems: "center",
                    borderWidth: 0.7,
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.25,
                    shadowRadius: 3.84,
                    elevation: 5,
                  }}
                  onPress={() => {
                    setProfileData({
                      ...profileData,
                      student: true,
                      workingProfessional: false,
                    });
                  }}
                >
                  <Icon
                    name="book"
                    size={20}
                    color={profileData.student ? "#fff" : "#000"}
                  />
                  <Text
                    style={{ color: profileData.student ? "#fff" : "#000" }}
                  >
                    Student
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={{
                    width: 150,
                    height: 60,
                    backgroundColor: profileData.workingProfessional
                      ? "#3498DB"
                      : "#fff", // Highlight blue if working professional
                    borderRadius: 10,
                    justifyContent: "center",
                    alignItems: "center",
                    borderWidth: 0.7,
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.25,
                    shadowRadius: 3.84,
                    elevation: 5,
                  }}
                  onPress={() => {
                    setProfileData({
                      ...profileData,
                      student: false,
                      workingProfessional: true,
                    });
                  }}
                >
                  <Icon
                    name="briefcase"
                    size={20}
                    color={profileData.workingProfessional ? "#fff" : "#000"}
                  />
                  <Text
                    style={{
                      color: profileData.workingProfessional ? "#fff" : "#000",
                    }}
                  >
                    Working professional
                  </Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          )}
        </View>
      </View>
    </LinearGradient>
  );
}
