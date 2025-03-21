import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View } from "react-native";
import Onboarding from "./screens/Onboardingscreen";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { NavigationContainer } from "@react-navigation/native";
import Login from "./screens/Login";
import Signup from "./screens/Signup";
import Welcome from "./screens/Welcome";
import Education from "./screens/Forms/Education";
import AreasOfInterest from "./screens/Forms/AreasOfInterest";
import CareerGoals from "./screens/Forms/CareerGoals";
import MentorAvailability from "./screens/Forms/MentorAvailability";
import { UserContext } from "./UserContext";
import MentorRequestScreen from "./screens/MentorRequestScreen";
import TabsWrapper from "./navigation/TabsWrapper";
import ChatMessagesScreen from "./screens/ChatMessagesScreen";
import Explore from "./screens/Explore";
import MyProfile from "./screens/Profile/MyProfile";
import MyConnections from "./screens/Profile/MyConnections";
import MyEvents from "./screens/Profile/MyEvents";
import CreateNewSession from "./screens/Sessions/CreateNewSession";
import CreateNewTopic from "./screens/Topics/CreateNewTopic";
import Password from "./screens/Profile/Password";
import ChangePassword from "./screens/Profile/ChangePassword";
import InviteParticipants from "./screens/Sessions/InviteParticipants";
import SessionBanner from "./screens/Sessions/SessionBanner";
import ScheduleSession from "./screens/Sessions/ScheduleSession";
import Session from "./screens/Session";
import PublicProfile from "./screens/PublicProfile";
import SplashScreen from "./screens/SplashScreen";
import InviteTopicParticipants from "./screens/Topics/InviteTopicParticipants";
import TopicBanner from "./screens/Topics/TopicBanner";
import TopicChatMessagesScreen from "./screens/TopicChatMessagesScreen";
import VerifyOTP from "./screens/VerifyOTP";
import SearchUsersScreen from "./screens/SearchUsersScreen";

const Stack = createNativeStackNavigator();

function App() {
  return (
    <>
      <StatusBar barStyle="light-content" />
      <UserContext>
        <NavigationContainer initialRouteName="Splash">
          <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen
              name="Splash"
              component={SplashScreen}
              options={{ animation: "ios" }}
            />
            <Stack.Screen
              name="Onboarding"
              component={Onboarding}
              options={{ animation: "fade" }}
            />
            <Stack.Screen
              name="Login"
              component={Login}
              options={{ animation: "slide_from_right" }}
            />
            <Stack.Screen
              name="Signup"
              component={Signup}
              options={{ animation: "slide_from_left" }}
            />
            <Stack.Screen
              name="Welcome"
              component={Welcome}
              options={{ animation: "fade" }}
            />
            <Stack.Screen name="Education" component={Education} />
            <Stack.Screen name="Interest" component={AreasOfInterest} />
            <Stack.Screen name="Career" component={CareerGoals} />
            <Stack.Screen name="Availability" component={MentorAvailability} />
            <Stack.Screen
              name="MentorRequest"
              component={MentorRequestScreen}
            />

            <Stack.Screen
              name="Community"
              component={TabsWrapper}
              options={{ animation: "fade" }}
            />
            <Stack.Screen
              name="Chat"
              component={TabsWrapper}
              options={{ animation: "slide_from_left" }}
            />
            <Stack.Screen name="Profile" component={TabsWrapper} />
            <Stack.Screen
              name="Messages"
              component={ChatMessagesScreen}
              options={{ animation: "ios" }}
            />
            <Stack.Screen name="Explore" component={Explore} />
            <Stack.Screen name="MyProfile" component={MyProfile} />
            <Stack.Screen name="MyConnection" component={MyConnections} />
            <Stack.Screen name="MyEvents" component={MyEvents} />
            <Stack.Screen name="Session" component={CreateNewSession} />
            <Stack.Screen name="Topics" component={CreateNewTopic} />
            <Stack.Screen
              name="Password"
              component={Password}
              options={{ animation: "ios" }}
            />
            <Stack.Screen
              name="ChangePassword"
              component={ChangePassword}
              options={{ animation: "ios" }}
            />
            <Stack.Screen
              name="InviteParticipants"
              component={InviteParticipants}
              options={{ animation: "ios" }}
            />
            <Stack.Screen
              name="Banner"
              component={SessionBanner}
              options={{ animation: "ios" }}
            />
            <Stack.Screen
              name="Schedule"
              component={ScheduleSession}
              options={{ animation: "ios" }}
            />
            <Stack.Screen
              name="Sessions"
              component={Session}
              options={{ animation: "fade" }}
            />
            <Stack.Screen
              name="PublicProfile"
              component={PublicProfile}
              options={{ animation: "fade" }}
            />
            <Stack.Screen
              name="AddTopicMembers"
              component={InviteTopicParticipants}
              options={{ animation: "ios" }}
            />
            <Stack.Screen
              name="TopicBanner"
              component={TopicBanner}
              options={{ animation: "ios" }}
            />
            <Stack.Screen
              name="TopicChatMessages"
              component={TopicChatMessagesScreen}
              options={{ animation: "ios" }}
            />
            <Stack.Screen
              name="VerifyOTP"
              component={VerifyOTP}
              options={{ animation: "ios" }}
            />
            <Stack.Screen
              name="SearchUsers"
              component={SearchUsersScreen}
              options={{ animation: "ios" }}
            />
          </Stack.Navigator>
        </NavigationContainer>
      </UserContext>
    </>
  );
}

export default App;
