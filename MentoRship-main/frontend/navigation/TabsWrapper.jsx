import React, { useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Modal,
  TouchableWithoutFeedback,
  Platform,
} from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import Community from "../screens/Community";
import Profile from "../screens/Profile";
import {
  FontAwesome,
  AntDesign,
  MaterialIcons,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import ChatsScreen from "../screens/ChatsScreen";

const Tab = createBottomTabNavigator();

const TabsWrapper = ({ navigation }) => {
  const [modalVisible, setModalVisible] = useState(false);

  const handlePlusButton = () => {
    setModalVisible(true);
  };

  const handleMenuItemPress = (menuItem) => {
    setModalVisible(false);
    switch (menuItem) {
      case "newConversation":
        navigation.navigate("Explore");
        break;
      case "createGroupSession":
        navigation.navigate("Session");
        break;
      case "createNewTopic":
        navigation.navigate("Topics");
        break;
      default:
        break;
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <Tab.Navigator
        screenOptions={{
          tabBarStyle: [
            {
              position: "absolute",
              bottom: 25,
              left: 20,
              right: 20,
              elevation: 0,
              backgroundColor: "#000",
              borderRadius: 15,
              height: 60,
              ...styles.shadow,
            },
            null,
          ],
          tabBarShowLabel: false,
          headerShown: false,
        }}
      >
        <Tab.Screen
          name="Communitypage"
          component={Community}
          options={{
            tabBarIcon: ({ focused }) => (
              <View style={styles.tabItem}>
                <FontAwesome
                  name="users"
                  size={26}
                  color={focused ? "#fff" : "#748c94"}
                />
                <Text style={styles.tabText}>Community</Text>
              </View>
            ),
          }}
        />
        <Tab.Screen
          name="ChatS"
          component={ChatsScreen}
          options={{
            tabBarIcon: ({ focused }) => (
              <View style={styles.tabItem}>
                <MaterialCommunityIcons
                  name="message-text" // Use the "chat-bubble" icon
                  size={26}
                  color={focused ? "#fff" : "#748c94"}
                />
                <Text style={styles.tabText}>Chats</Text>
              </View>
            ),
          }}
        />

        <Tab.Screen
          name="Profile"
          component={Profile}
          options={{
            tabBarIcon: ({ focused }) => (
              <View style={styles.tabItem}>
                <FontAwesome
                  name="user"
                  size={26}
                  color={focused ? "#fff" : "#748c94"}
                />
                <Text style={styles.tabText}>Profile</Text>
              </View>
            ),
          }}
        />
      </Tab.Navigator>
      <TouchableOpacity style={styles.addButton} onPress={handlePlusButton}>
        <AntDesign name="plus" size={27} color="#fff" />
      </TouchableOpacity>
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(false);
        }}
      >
        <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
          <View style={styles.modalOverlay} />
        </TouchableWithoutFeedback>
        <View style={styles.modalBottom}>
          <View style={styles.modalView}>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => handleMenuItemPress("createGroupSession")}
            >
              <AntDesign name="camera" size={20} color="black" />
              <Text style={styles.menuText}>Create New Group Session</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => handleMenuItemPress("createNewTopic")}
            >
              <FontAwesome name="hashtag" size={20} color="black" />
              <Text style={styles.menuText}>Create New Topic</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => handleMenuItemPress("newConversation")}
            >
              <FontAwesome name="comments" size={20} color="black" />
              <Text style={styles.menuText}>New Conversation</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default TabsWrapper;

const styles = StyleSheet.create({
  shadow: {
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  tabItem: {
    marginTop: Platform.OS === "ios" ? 17 : 0,
    flexDirection: "column",
    alignItems: "center",
    justifyContent: Platform.OS === "ios" ? "" : "center",
  },

  tabText: {
    color: "#748c94",
    fontSize: 11,
  },
  addButton: {
    position: "absolute",
    bottom: 100,
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#5DC8D7",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1,
  },
  modalOverlay: {
    flex: 1,
  },
  modalBottom: {
    position: "absolute",
    bottom: 150,
    right: 15,
    width: "100%",
    alignItems: "center",
  },
  modalView: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 20,
    marginHorizontal: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
    gap: 10,
  },
  menuText: {
    marginLeft: 10,
    fontSize: 16,
  },
});
