import React, { useContext, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  TextInput,
  StatusBar,
  Image,
  Alert,
} from "react-native";
import Icon from "react-native-vector-icons/FontAwesome5";
import * as ImagePicker from "expo-image-picker";

import axios from "axios";
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

export default function SessionBanner({ navigation }) {
  const [image, setImage] = useState(null);
  const [altText, setAltText] = useState("");
  const { userId, sessionId } = useContext(UserType);
  const [bannerImage, setBannerImage] = useState("");

  const handleChooseImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    console.log("Permission status:", status);

    if (status !== "granted") {
      alert("Sorry, we need camera roll permissions to make this work!");
      return;
    }

    const response = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
    });

    console.log("Response:", response);

    if (!response.cancelled && response.assets && response.assets.length > 0) {
      const { uri } = response.assets[0];
      console.log("Selected Image URI:", uri);
      setBannerImage(uri);
      console.log("Profile Image State:", bannerImage);
    } else {
      console.log("No image selected");
    }
  };

  const handleUploadImage = async () => {
    try {
      if (!bannerImage) {
        Alert.alert("Error", "Please select an image.");
        return;
      }

      const formData = new FormData();
      formData.append("image", {
        name: new Date().toISOString() + "_banner.jpg",
        type: "image/jpg",
        uri: bannerImage,
      });

      const response = await axios.post(
        `https://mentorship-backends-rahul-mistrys-projects.vercel.app/upload-banner/${sessionId}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      console.log("Image upload response:", response.data);
      navigation.navigate("Schedule");
    } catch (error) {
      console.error("Error uploading image:", error);
      Alert.alert("Error", "Failed to upload image. Please try again.");
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
        Session Banner
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
          paddingHorizontal: 15,
        }}
      >
        <Text
          style={{
            fontSize: 15,
            marginTop: 15,
            color: "#5A5A5A",
          }}
        >
          Give people an idea about what your session is about and make it
          recognizable for the members.
        </Text>
        <TouchableOpacity
          onPress={handleChooseImage}
          style={{
            backgroundColor: "#F1F1F3",
            width: 350,
            height: 150,
            borderRadius: 10,
            justifyContent: "center",
            alignItems: "center",
            marginTop: 20,
            borderWidth: 1,
            borderColor: "#09A1F6",
          }}
        >
          {bannerImage ? (
            <Image
              source={{ uri: bannerImage }}
              style={{ width: 350, height: 150, borderRadius: 10 }}
            />
          ) : (
            <View
              style={{
                width: 350,
                height: 150,
                borderRadius: 10,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text style={{ fontSize: 18, color: "#000", marginBottom: 10 }}>
                Image Preview
              </Text>
            </View>
          )}
        </TouchableOpacity>
        <Text
          style={{
            fontSize: 15,
            marginTop: 20,
            color: "#5A5A5A",
          }}
        >
          Banner Image Alt Text (Optional)
        </Text>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginTop: 10,
          }}
        >
          <TextInput
            placeholder="Banner Image Alt Text"
            style={{
              flex: 1,
              height: 40,
              borderColor: "#D9D9D9",
              borderWidth: 1,
              borderRadius: 5,
              paddingHorizontal: 10,
            }}
            value={altText}
            onChangeText={setAltText}
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
        <NavigationLine active={true} />
        <NavigationLine active={true} />
        <NavigationLine active={false} />
      </View>
      <TouchableOpacity
        onPress={handleUploadImage}
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
        <Text
          style={{
            fontSize: 20,
            color: "#FFFFFF",
            fontWeight: "bold",
          }}
        >
          Next
        </Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}
