import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { useNavigation } from "@react-navigation/native";

const MembersComponent = () => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const navigation = useNavigation();

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    try {
      const response = await fetch("https://mentorship-backends-rahul-mistrys-projects.vercel.app/members");
      const data = await response.json();
      if (response.ok) {
        setMembers(data.members);
      } else {
        console.error("Error fetching members:", data.message);
      }
    } catch (error) {
      console.error("Error fetching members:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchMembers();
  };

  const navigateToPublicProfile = (userId) => {
    navigation.navigate("PublicProfile", { userId });
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={{
        marginTop: 20,
        width: 200,
        height: 150,
        backgroundColor: "#F4F4F4",
        borderRadius: 20,
        borderColor: "#D9D9D9",
        borderWidth: 2,
        alignItems: "center",
        marginHorizontal: 90,
        shadowColor: "#000",
        shadowOffset: {
          width: 5,
          height: 1,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        elevation: 5,
      }}
      onPress={() => navigateToPublicProfile(item._id)}
    >
      <Image
        source={{ uri: item.image }}
        style={{ width: 60, height: 60, marginTop: 20, borderRadius: 30 }}
      />
      <Text style={{ fontWeight: "bold", fontSize: 16, textAlign: "center" }}>
        {item.name}
      </Text>
      <Text style={{ textAlign: "center", flexWrap: "wrap" }}>
        {item.Headline}
      </Text>
    </TouchableOpacity>
  );

  return (
    <>
      <FlatList
        data={members}
        renderItem={renderItem}
        keyExtractor={(item) => item._id}
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingTop: 20,
          alignItems: "center",
          paddingBottom: 250,
        }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListHeaderComponent={
          loading ? (
            <View
              style={{
                flex: 1,
                backgroundColor: "#fff",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <ActivityIndicator size="small" color="#000" />
            </View>
          ) : null
        }
      />
      <View style={{ marginBottom: 1000 }}></View>
    </>
  );
};

export default MembersComponent;
