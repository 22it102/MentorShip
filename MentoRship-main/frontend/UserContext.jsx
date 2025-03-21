import { createContext, useState } from "react";

const UserType = createContext();

const UserContext = ({ children }) => {
  const [userId, setUserId] = useState("");
  const [sessionId, setSessionId] = useState("");
  const [topicId, setTopicId] = useState("");
  const loggedInUserId = userId;
  return (
    <UserType.Provider
      value={{
        userId,
        setUserId,
        sessionId,
        loggedInUserId,
        setSessionId,
        topicId,
        setTopicId,
      }}
    >
      {children}
    </UserType.Provider>
  );
};

export { UserType, UserContext };
