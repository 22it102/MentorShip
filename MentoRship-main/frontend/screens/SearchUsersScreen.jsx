import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Image,
  StatusBar,
  Platform,
  ActivityIndicator,
} from "react-native";
import axios from "axios";
import { MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

const SearchUsersScreen = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = React.createRef();
  const [isTyping, setIsTyping] = useState(false);

  const searchUsers = async (query) => {
    setIsLoading(true);
    try {
      const response = await axios.post(
        "https://mentorship-backends-rahul-mistrys-projects.vercel.app/users/search",
        { searchString: query }
      );
      setSearchResults(response.data);
    } catch (error) {
      console.error("Error searching users:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (text) => {
    setSearchQuery(text); // Update search query state
    if (text.trim() !== "") {
      // Check if search query is not empty
      searchUsers(text); // Fetch data based on the updated search query
      setIsTyping(true);
    } else {
      setSearchResults([]); // Clear search results if query is empty
      setIsTyping(false);
    }
  };

  const navigateToPublicProfile = (userId) => {
    navigation.navigate("PublicProfile", { userId });
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.userItem}
      onPress={() => navigateToPublicProfile(item._id)}
    >
      <Image source={{ uri: item.image }} style={styles.userImage} />
      <View style={styles.userInfo}>
        <Text style={styles.userName}>{item.name}</Text>
        <Text style={styles.userHeadline}>{item.Headline}</Text>
      </View>
    </TouchableOpacity>
  );

  const NoResultsMessage = () => (
    <View style={styles.noResultsContainer}>
      <Text style={styles.noResultsText}>
        No results found. Start searching!
      </Text>
    </View>
  );

  return (
    <LinearGradient
      colors={["#000000", "#007CB0"]}
      style={{ flex: 1 }}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
      locations={[0.3, 1]}
    >
      <StatusBar barStyle="light-content" />
      <View style={{ flex: 1 }}>
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
            Discover Connections
          </Text>
        </View>
        <View
          style={{
            flex: 1,
            borderTopStartRadius: 50,
            borderTopEndRadius: 50,
            backgroundColor: "#FFFFFF",
            marginTop: 20,
          }}
        >
          <View
            style={[
              styles.searchContainer,
              isTyping && { borderBottomColor: "#09A1F6" },
            ]}
          >
            <MaterialIcons
              name="search"
              size={20}
              color="#666"
              style={styles.searchIcon}
            />
            <TextInput
              style={styles.searchInput}
              placeholder="Search users..."
              value={searchQuery}
              onChangeText={handleSearch}
            />
          </View>
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color="#000" />
              <Text style={styles.loadingText}>Please wait...</Text>
            </View>
          ) : (
            <FlatList
              data={searchResults}
              renderItem={renderItem}
              keyExtractor={(item, index) => item._id || index.toString()} // Use _id if available, otherwise use index
              contentContainerStyle={styles.flatlistContent}
              ListEmptyComponent={NoResultsMessage} // Render message when no results are found
            />
          )}
        </View>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    borderRadius: 20,
    paddingHorizontal: 15,
    marginHorizontal: 10,
    backgroundColor: "#f5f5f5",
    marginTop: 30,
    borderBottomWidth: 1.8,
    borderBottomColor: "#000",
  },
  searchInput: {
    flex: 1,
    height: 60,
    paddingHorizontal: 10,
    fontSize: 15,
  },
  searchIcon: {
    marginRight: 10,
  },
  flatlistContent: {
    paddingTop: 10,
    paddingHorizontal: 20,
  },
  userItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  userImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 15,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 5,
  },
  userHeadline: {
    fontSize: 14,
    color: "#666",
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
  },
  noResultsContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  noResultsText: {
    fontSize: 16,
    color: "#666",
  },
});

export default SearchUsersScreen;
