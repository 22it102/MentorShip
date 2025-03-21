const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcrypt");
const os = require("os");
const app = express();
const morgan = require("morgan");
const cors = require("cors");
const dotenv = require("dotenv");
const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("cloudinary").v2;
const generateOTP = require("./helpers/generateOTP");
const nodemailer = require("nodemailer");

app.use(morgan("dev"));
app.use(cors());

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(passport.initialize());
const jwt = require("jsonwebtoken");
dotenv.config();

const port = process.env.PORT;

mongoose
  .connect(process.env.MONGO_URL)
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((err) => {
    console.log("Error connecting to MongoDB", err);
  });

app.listen(port, () => {
  //* Get local IP addresses
  const interfaces = os.networkInterfaces();
  let internetConnectedIP = null;

  //* Loop through network interfaces to find the one with internet connection
  Object.values(interfaces).forEach((interface) => {
    interface.forEach((details) => {
      if (details.family === "IPv4" && !details.internal) {
        internetConnectedIP = details.address;
      }
    });
  });

  console.log(
    `Server is running on ${internetConnectedIP || "Unknown"} and Port ${port}`
  );
});

app.get("/", (req, res) => {
  res.send(`<!DOCTYPE html>
  <html lang="en">

  <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Backend API Status</title>
      <style>
          body {
              margin: 0;
              padding: 0;
              height: 100vh;
              display: flex;
              justify-content: center;
              align-items: center;
              background-color: #000;
              color: #fff;
              font-family: Arial, sans-serif;
              font-size: 24px;
          }
      </style>
  </head>

  <body>
      <div>
          <p>The Backend API is running perfectly</p>
      </div>
  </body>

  </html>`);
});

const User = require("./models/user");
const Message = require("./models/message");
const GroupSession = require("./models/session");
const { Topic, Participant } = require("./models/topic");

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Set up storage using Cloudinary
const storages = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "uploads",
    allowed_formats: ["jpg", "jpeg", "png"],
    transformation: [
      { width: 500, height: 500, crop: "limit" },
      { quality: "auto" },
      { fetch_format: "auto" },
    ],
  },
});
// Create Multer instance with storage configuration
const uploads = multer({ storage: storages });

// Sending Email to User
const transporter = nodemailer.createTransport({
  service: "gmail",
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.USER_EMAIL,
    pass: process.env.USER_PASSWORD,
  },
});

const sendMail = async (to, subject, text, html) => {
  const mailOptions = {
    from: {
      name: "MentoRship",
      address: process.env.USER_EMAIL,
    },
    to,
    subject,
    text,
    html,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("Mail sent successfully");
  } catch (error) {
    console.log(error);
  }
};

// Endpoint to register users with image upload
app.post("/register", uploads.single("image"), async (req, res) => {
  const { name, email, password } = req.body;
  const image = req.file ? req.file.path : null; // Check if image file is uploaded

  try {
    // Check if user with the same email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        message:
          "Email already registered. Please try again with a different email.",
      });
    }

    // Generate OTP
    const otp = generateOTP();
    // Hash the password before saving it
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new User object with hashed password and image path
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      image,
      otp,
    });

    // Save the user to the database
    await newUser.save();

    // Send OTP to the user's email
    const subject = "Your OTP for MentoRship registration";
    const text = `Your OTP for registration is: ${otp}`;
    const html = `<p>Your OTP for registration is: <strong>${otp}</strong></p>`;
    await sendMail(email, subject, text, html);

    // Generate JWT token for the new user
    const token = createToken(newUser._id);
    res.status(201).json({ token, message: "User registered successfully" });
  } catch (err) {
    console.log("Error registering user", err);
    res.status(500).json({ message: "Error registering the user!" });
  }
});

//function to create a token for the user
const createToken = (userId) => {
  // Set the token payload
  const payload = {
    userId: userId,
  };

  // Generate the token with a secret key and expiration time
  const token = jwt.sign(payload, process.env.JWT_SECRET_KEY, {
    expiresIn: "4h",
  });

  return token;
};
// Endpoint to verify OTP and login
app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!user.isActive) {
      return res.status(403).json({ message: "User is disabled" });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(401).json({ message: "Invalid Password!" });
    }

    // Generate OTP
    const otp = generateOTP();

    // Store OTP in the user document
    user.otp = otp;
    await user.save();

    // Send OTP to the user's email
    const subject = "Your OTP for MentoRship login";
    const text = `Your OTP for login is: ${otp}`;
    const html = `<p>Your OTP for login is: <strong>${otp}</strong></p>`;
    await sendMail(email, subject, text, html);

    // Check if the user is onboarded
    const onboarded = user.Onboarded;

    // Generate token with onboarded status
    const token = createToken(user._id);
    res.status(200).json({ token, otp });
  } catch (error) {
    console.log("Error in finding the user", error);
    res.status(500).json({ message: "Internal server Error!" });
  }
});
// Endpoint api to verify otp
app.post("/verify-otp", async (req, res) => {
  try {
    const { userId, otp } = req.body;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    if (user.otp === otp) {
      // Remove OTP from user
      user.otp = null;
      await user.save();

      return res.status(200).json({ message: "OTP is valid" });
    } else {
      // OTP is incorrect
      return res.status(400).json({ message: "Invalid OTP" });
    }
  } catch (error) {
    console.error("Error in OTP verification:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});
//endpoint to access all the users except the user who's is currently logged in!
app.get("/users/:userId", (req, res) => {
  const loggedInUserId = req.params.userId;

  User.find({ _id: { $ne: loggedInUserId } })
    .then((users) => {
      res.status(200).json(users);
    })
    .catch((err) => {
      console.log("Error retrieving users", err);
      res.status(500).json({ message: "Error retrieving users" });
    });
});

//endpoint to send a request to a user
app.post("/friend-request", async (req, res) => {
  const { currentUserId, selectedUserId } = req.body;

  try {
    //update the recepient's friendRequestsArray!
    await User.findByIdAndUpdate(selectedUserId, {
      $push: { friendRequests: currentUserId },
    });

    //update the sender's sentFriendRequests array
    await User.findByIdAndUpdate(currentUserId, {
      $push: { sentFriendRequests: selectedUserId },
    });

    res.sendStatus(200);
  } catch (error) {
    res.sendStatus(500);
  }
});

//endpoint to show all the friend-requests of a particular user
app.get("/friend-request/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    //fetch the user document based on the User id
    const user = await User.findById(userId)
      .populate("friendRequests", "name email image")
      .lean();

    const friendRequests = user.friendRequests;

    res.json(friendRequests);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

//endpoint to accept a friend-request of a particular person
app.post("/friend-request/accept", async (req, res) => {
  try {
    const { senderId, recepientId } = req.body;

    const sender = await User.findById(senderId);
    const recepient = await User.findById(recepientId);

    sender.friends.push(recepientId);
    recepient.friends.push(senderId);

    recepient.friendRequests = recepient.friendRequests.filter(
      (request) => request.toString() !== senderId.toString()
    );
    sender.sentFriendRequests = sender.sentFriendRequests.filter(
      (request) => request.toString() !== recepientId.toString()
    );
    await sender.save();
    await recepient.save();

    res.status(200).json({ message: "Friend Request accepted successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

//endpoint to access all the friends of the logged in user!
app.get("/accepted-friends/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId).populate(
      "friends",
      "name email image"
    );
    const acceptedFriends = user.friends;
    res.json(acceptedFriends);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Configure multer for handling file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "files/"); // Specify the desired destination folder
  },
  filename: function (req, file, cb) {
    // Generate a unique filename for the uploaded file
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + "-" + file.originalname);
  },
});

const upload = multer({ storage: storage });

// Endpoint to post Messages and store it in the backend
app.post("/messages", upload.single("imageFile"), async (req, res) => {
  try {
    const { senderId, recepientId, messageType, messageText } = req.body;

    const newMessage = new Message({
      senderId,
      recepientId,
      messageType,
      message: messageText,
      timestamp: new Date(),
      imageUrl: messageType === "image" ? req.file.path : null,
      sent: true, // Mark the message as sent when created
      read: false, // Mark the message as not read initially
    });

    await newMessage.save();
    res.status(200).json({ message: "Message sent Successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Endpoint to post Messages and store it in the backend
app.post("/messages", upload.single("imageFile"), async (req, res) => {
  try {
    const { senderId, recepientId, messageType, messageText } = req.body;

    const newMessage = new Message({
      senderId,
      recepientId,
      messageType,
      message: messageText,
      timestamp: new Date(),
      imageUrl: messageType === "image" ? req.file.path : null,
      sent: true, // Mark the message as sent when created
      read: false, // Mark the message as not read initially
    });

    await newMessage.save();
    res.status(200).json({ message: "Message sent Successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal Server Error" }``);
  }
});

// Endpoint to mark a message as read
app.put("/messages/read/:messageId", async (req, res) => {
  try {
    const { messageId } = req.params;

    // Find the message by messageId and update the read status to true
    await Message.findByIdAndUpdate(messageId, { read: true });

    res.status(200).json({ message: "Message read successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

///endpoint to get the userDetails to design the chat Room header
app.get("/user/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    //fetch the user data from the user ID
    const recepientId = await User.findById(userId);

    res.json(recepientId);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

//endpoint to fetch the messages between two users in the chatRoom
app.get("/messages/:senderId/:recepientId", async (req, res) => {
  try {
    const { senderId, recepientId } = req.params;

    const messages = await Message.find({
      $or: [
        { senderId: senderId, recepientId: recepientId },
        { senderId: recepientId, recepientId: senderId },
      ],
    }).populate("senderId", "_id name");

    res.json(messages);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

//endpoint to delete the messages!
app.post("/deleteMessages", async (req, res) => {
  try {
    const { messages } = req.body;

    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ message: "invalid req body!" });
    }

    await Message.deleteMany({ _id: { $in: messages } });

    res.json({ message: "Message deleted successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal Server" });
  }
});

app.get("/friend-requests/sent/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId)
      .populate("sentFriendRequests", "name email image")
      .lean();

    const sentFriendRequests = user.sentFriendRequests;

    res.json(sentFriendRequests);
  } catch (error) {
    console.log("error", error);
    res.status(500).json({ error: "Internal Server" });
  }
});

app.get("/friends/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId)
      .populate("friends", "name image")
      .lean();

    const friends = user.friends;

    res.json(friends);
  } catch (error) {
    console.log("error", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Endpoint to fetch user data based on userId
app.get("/user-data/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    // Fetch user data from the database
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Return user data
    res.status(200).json({ name: user.name, image: user.image });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Onboarding/v1 API endpoint for welcome.js
app.post("/onboarding/v1", async (req, res) => {
  try {
    // Extract user data and userId from request body
    const {
      userId,
      First_Name,
      Last_Name,
      Pronoun,
      Gender,
      Race,
      Country,
      State,
      City,
      Role,
      Student,
      Mentor,
    } = req.body;

    // Validate required fields
    if (
      !userId ||
      !First_Name ||
      !Last_Name ||
      !Pronoun ||
      !Gender ||
      !Role ||
      Student === undefined ||
      Mentor === undefined
    ) {
      return res.status(400).json({
        message:
          "userId, First_Name, Last_Name, Pronoun, Gender, Role, Student, and Mentor are required fields.",
      });
    }

    // Find the user by userId
    const user = await User.findById(userId);

    // If user not found, return error
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Update user data with the provided fields
    user.First_Name = First_Name;
    user.Last_Name = Last_Name;
    user.Pronoun = Pronoun;
    user.Gender = Gender;
    user.Race = Race;
    user.Country = Country;
    user.State = State;
    user.City = City;
    user.Role = Role;
    user.Student = Student;
    user.Mentor = Mentor;

    // Save the updated user to the database
    await user.save();

    // Return success response
    res.status(200).json({ message: "User onboarded successfully", user });
  } catch (err) {
    console.log("Error onboarding user", err);
    res.status(500).json({ message: "Error onboarding user" });
  }
});

// Endpoint to handle onboarding v2 data
app.post("/onboarding/v2", async (req, res) => {
  try {
    // Extract data from the request body
    const {
      userId,
      Affiliation,
      Headline,
      Experience,
      Education,
      Degree,
      Major,
      GradeYear,
    } = req.body;

    // Validate required fields
    if (!userId || !Headline || !Experience) {
      return res.status(400).json({
        message: "userId, Headline, and Experience are required fields.",
      });
    }

    // Find the user by userId
    const user = await User.findById(userId);

    // If user not found, return error
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Update user data with the provided fields
    user.Affiliation = Affiliation;
    user.Headline = Headline;
    user.Experience = Experience;
    user.Education = Education;
    user.Degree = Degree;
    user.Major = Major;
    user.GradeYear = GradeYear;

    // Save the updated user to the database
    await user.save();

    // Return success response
    res.status(200).json({ message: "User onboarded successfully", user });
  } catch (err) {
    console.log("Error onboarding user", err);
    res.status(500).json({ message: "Error onboarding user" });
  }
});

// POST endpoint for onboarding/v3
app.post("/onboarding/v3", async (req, res) => {
  try {
    const { userId, areasOfInterest } = req.body;

    // Find the user by userId
    const user = await User.findById(userId);
    console.log(user.name);
    console.log(areasOfInterest);
    // If user not found, return error
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Update user's areasOfInterest field
    user.areasOfInterest = areasOfInterest;

    // Save the updated user to the database
    await user.save();

    // Return success response
    res.status(200).json({ message: "Areas of interest updated successfully" });
  } catch (err) {
    console.log("Error updating areas of interest", err);
    res.status(500).json({ message: "Error updating areas of interest" });
  }
});

// Write POST endpoint for onboarding/v4 for Career Goals.
// POST endpoint for onboarding/v4 to update Career Goals
app.post("/onboarding/v4", async (req, res) => {
  try {
    const { userId, careerGoals } = req.body;

    // Find the user by userId
    const user = await User.findById(userId);

    // If user not found, return error
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Update user's career goals field
    user.Career_Goals = careerGoals;

    // Save the updated user to the database
    await user.save();

    // Return success response
    res.status(200).json({ message: "Career goals updated successfully" });
  } catch (err) {
    console.log("Error updating career goals", err);
    res.status(500).json({ message: "Error updating career goals" });
  }
});

// Endpoint to update or get last seen time
app.get("/user/last-seen/:recipientId", async (req, res) => {
  try {
    const { recipientId } = req.params;
    const recipient = await User.findById(recipientId);
    if (recipient) {
      res.status(200).json({ lastSeen: recipient.lastSeen });
    } else {
      res.status(404).json({ error: "Recipient not found" });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Endpoint to update sender's last seen time
app.put("/user/last-seen/:senderId", async (req, res) => {
  try {
    const { senderId } = req.params;
    const sender = await User.findByIdAndUpdate(
      senderId,
      { lastSeen: new Date() },
      { new: true }
    );
    if (sender) {
      res.status(200).json({ message: "Last seen time updated successfully" });
    } else {
      res.status(404).json({ error: "Sender not found" });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// New endpoint to check if user is onboarded
app.get("/user-onboarded/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    // Fetch the user by userId
    const user = await User.findById(userId);

    // If user not found, return error
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if the user is onboarded
    const onboarded = user.Onboarded;

    // Return onboarded status
    res.status(200).json({ onboarded });
  } catch (error) {
    console.log("Error checking user onboarded status", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Endpoint to fetch user details
app.get("/user-details/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    // Fetch user data from the database
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Return user data
    res.status(200).json({
      name: user.name,
      image: user.image,
      headline: user.Headline,
      country: user.Country,
      state: user.State,
      city: user.City,
      gender: user.Gender,
      raceEthnicity: user.Race,
      role: user.Role,
      education: user.Education,
      experience: user.Experience,
      careerGoals: user.Career_Goals,
      student: user.Student,
      workingProfessional: user.Mentor,
      FirstName: user.First_Name,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Endpoint to update user details
app.put("/user-update/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    // Fetch user data from the database
    let user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Update user details based on request body
    const {
      image,
      headline,
      country,
      state,
      city,
      gender,
      raceEthnicity,
      role,
      education,
      experience,
      careerGoals,
      student,
      workingProfessional,
    } = req.body;

    // Update user object
    user.image = image || user.image;
    user.Headline = headline || user.Headline;
    user.Country = country || user.Country;
    user.State = state || user.State;
    user.City = city || user.City;
    user.Gender = gender || user.Gender;
    user.Race = raceEthnicity || user.Race;
    user.Role = role || user.Role;
    user.Education = education || user.Education;
    user.Experience = experience || user.Experience;
    user.Career_Goals = careerGoals || user.Career_Goals;
    user.Student = student || user.Student;
    user.Mentor = workingProfessional || user.Mentor;

    // Save the updated user to the database
    user = await user.save();

    // Return success response
    res
      .status(200)
      .json({ message: "User details updated successfully", user });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// New endpoint to set onboarded status for a user
app.post("/onboarded/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    // Find the user by userId
    const user = await User.findById(userId);

    // If user not found, return error
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Set Onboarded field to true
    user.Onboarded = true;

    // Save the updated user to the database
    await user.save();

    // Return success response
    res.status(200).json({ message: "User onboarded successfully" });
  } catch (error) {
    console.log("Error onboarding user", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Endpoint to create a new session
app.post("/create-session", async (req, res) => {
  const { createdBy, sessionName, description, careerGoals, public } = req.body;
  try {
    // Save session to database
    const newSession = new GroupSession({
      createdBy,
      sessionName,
      description,
      careerGoals,
      public,
    });
    const savedSession = await newSession.save();
    res
      .status(201)
      .json({ session: savedSession, sessionId: savedSession._id });
  } catch (error) {
    console.error("Error creating session:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// Endpoint to invite friends
app.post("/invite-friends/:sessionId", async (req, res) => {
  const { sessionId } = req.params;
  const { invitedFriends } = req.body;
  try {
    // Fetch session by ID
    const session = await GroupSession.findById(sessionId);
    if (!session) {
      return res.status(404).json({ message: "Session not found" });
    }

    // Ensure invitedFriends is an array
    if (!Array.isArray(invitedFriends)) {
      return res
        .status(400)
        .json({ message: "Invited friends should be an array" });
    }

    // Add invited friends as attendees to the session
    for (const friendId of invitedFriends) {
      const attendee = await User.findById(friendId);
      if (attendee) {
        session.attendees.push({
          userId: attendee._id,
          name: attendee.name,
          image: attendee.image,
          status: "attending",
        });
      }
    }

    // Save the updated session
    await session.save();

    res.status(200).json({ message: "Friends invited successfully" });
  } catch (error) {
    console.error("Error inviting friends:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// Endpoint to upload session banner and alt text
app.post(
  "/upload-banner/:sessionId",
  uploads.single("image"),
  async (req, res) => {
    const { sessionId } = req.params;
    const image = req.file ? req.file.path : null;
    const imageUrl = image;
    try {
      // Fetch session by ID
      const session = await GroupSession.findById(sessionId);
      if (!session) {
        return res.status(404).json({ message: "Session not found" });
      }

      // Update session banner and alt text
      session.banner = imageUrl;
      await session.save();
      res.status(200).json({ message: "Banner uploaded successfully" });
    } catch (error) {
      console.error("Error uploading banner:", error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  }
);

// Endpoint to select schedule
app.post("/select-schedule/:sessionId", async (req, res) => {
  const { sessionId } = req.params;
  const { date, time, duration } = req.body;
  try {
    // Fetch session by ID
    const session = await GroupSession.findById(sessionId);
    if (!session) {
      return res.status(404).json({ message: "Session not found" });
    }

    // Update session schedule
    session.date = date;
    session.time = time;
    session.duration = duration;
    await session.save();
    res.status(200).json({ message: "Schedule selected successfully" });
  } catch (error) {
    console.error("Error selecting schedule:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// Endpoint to attend a session
app.post("/attend-session/:sessionId", async (req, res) => {
  const { sessionId } = req.params;
  const { userId } = req.body;
  try {
    // Find the session by ID
    const session = await GroupSession.findById(sessionId);
    if (!session) {
      return res.status(404).json({ message: "Session not found" });
    }

    // Check if the session is public
    if (session.public) {
      // If public, add the user as an attendee
      session.attendees.push({
        userId,
        status: "attending",
      });
      await session.save();
      return res.status(200).json({ message: "Attended session successfully" });
    } else {
      // If private, send a request to the organizer
      // Here, you would typically implement a notification system to notify the organizer
      session.attendees.push({
        userId,
        status: "pending",
      });
      await session.save();
      return res.status(200).json({ message: "Request sent to organizer" });
    }
  } catch (error) {
    console.error("Error attending session:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

app.post("/accept-request/:sessionId", async (req, res) => {
  const { sessionId } = req.params;
  const { userId } = req.body;
  try {
    // Find the session by ID
    const session = await GroupSession.findById(sessionId);
    if (!session) {
      return res.status(404).json({ message: "Session not found" });
    }

    // Find the attendee request
    const attendee = session.attendees.find(
      (attendee) =>
        String(attendee.userId) === String(userId) &&
        attendee.status === "pending"
    );
    if (!attendee) {
      return res.status(404).json({ message: "Attendee request not found" });
    }

    // Update the status to attending
    attendee.status = "attending";
    await session.save();

    return res.status(200).json({ message: "Request accepted successfully" });
  } catch (error) {
    console.error("Error accepting request:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// Endpoint to fetch all friends of a user with their name, image, headline, and IDs
app.get("/user-friends/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    // Find the user by userId and populate the friends field
    const user = await User.findById(userId).populate({
      path: "friends",
      select: "_id name image headline", // Include _id field for friend IDs
    });

    // If user not found, return error
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Extract friend details (name, image, headline, and _id) from the populated friends array
    const friends = user.friends.map((friend) => ({
      _id: friend._id,
      name: friend.name,
      image: friend.image,
      headline: friend.headline, // Corrected to lowercase 'headline'
    }));

    res.status(200).json({ friends }); // Return friends array with IDs
  } catch (error) {
    console.log("Error fetching user friends:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});
// Endpoint to retrieve the public profile of a particular user
app.get("/public-profile/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    // Fetch user data from the database
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Extract required details from the user object
    const publicProfile = {
      name: user.name,
      image: user.image,
      headline: user.Headline,
      areaOfInterest: user.areasOfInterest.map((interest) => interest.title),
      careerGoals: user.Career_Goals,
      education: user.Education,
      country: user.Country,
      state: user.State,
      role: user.Role,
      gradeYear: user.GradeYear,
      major: user.Major,
      degree: user.Degree,
      // Add social media URLs to the public profile
      socialMedia: {
        linkedIn: user.socialMedia.linkedIn,
        instagram: user.socialMedia.instagram,
        facebook: user.socialMedia.facebook,
        twitter: user.socialMedia.twitter,
      },
    };

    // Return the public profile
    res.status(200).json(publicProfile);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Endpoint to deactivate/delete user account
app.delete("/delete-account/:userId", async (req, res) => {
  const { userId } = req.params;
  const { password } = req.body;

  try {
    // Find the user by ID
    const user = await User.findById(userId);

    // If user not found, return error
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Verify user password
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ message: "Invalid password" });
    }

    // Deactivate/delete the account by setting isActive to false
    user.isActive = false;
    await user.save();

    // Respond with success message
    res
      .status(200)
      .json({ message: "Account deactivated/deleted successfully" });
  } catch (error) {
    console.log("Error deactivating/deleting account:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Endpoint to change password
app.post("/change-password/:userId", async (req, res) => {
  const { userId } = req.params;
  const { oldPassword, newPassword } = req.body;

  try {
    // Find the user by userId
    const user = await User.findById(userId);

    // If user not found, return error
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Verify old password
    const passwordMatch = await bcrypt.compare(oldPassword, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ message: "Incorrect old password" });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10); // Hash with salt rounds 10

    // Update user's password in the database
    user.password = hashedPassword;
    await user.save();

    // Respond with success message
    res.status(200).json({ message: "Password changed successfully" });
  } catch (error) {
    console.log("Error changing password:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Endpoint to fetch all sessions of a user
app.get("/user-sessions/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    // Find all sessions where the user is the creator or an attendee
    const sessions = await GroupSession.find({
      $or: [{ createdBy: userId }, { "attendees.userId": userId }],
    });

    // Return the sessions
    res.status(200).json({ sessions });
  } catch (error) {
    console.log("Error fetching user sessions:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Endpoint for requesting name of user
app.get("/:userId/name", async (req, res) => {
  try {
    const userId = req.params.userId;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json({ name: user.name, image: user.image });
  } catch (error) {
    console.error("Error fetching user name:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});
// API to create Topic
app.post("/create-topic", async (req, res) => {
  const { createdBy, topicName, description, careerGoals, isPublic } = req.body;
  try {
    // Save topic to database
    const newTopic = new Topic({
      createdBy,
      topicName,
      description,
      careerGoals,
      isPublic,
      imageURL: "",
    });
    const savedTopic = await newTopic.save();
    res
      .status(201)
      .json({ topicId: savedTopic._id, message: "Topic created successfully" });
  } catch (error) {
    console.error("Error creating topic:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// Endpoint to post Messages and store it in the backend for a specific topic
app.post(
  "/topics/:topicId/messages",
  uploads.single("imageFile"),
  async (req, res) => {
    try {
      const { senderId, messageType, messageText } = req.body;
      const { topicId } = req.params;

      // Fetch sender's name from the database based on senderId
      const sender = await User.findById(senderId);
      if (!sender) {
        return res.status(404).json({ message: "Sender not found" });
      }

      const newMessage = {
        senderId,
        senderName: sender.name,
        messageType,
        message: messageText,
        timestamp: new Date(),
        imageUrl: messageType === "image" ? req.file.path : null,
        sent: true, // Mark the message as sent when created
        read: false, // Mark the message as not read initially
      };

      // Find the topic by ID
      const topic = await Topic.findById(topicId);
      if (!topic) {
        return res.status(404).json({ message: "Topic not found" });
      }

      // Add the new message to the topic's messages array
      topic.groupMessages.push(newMessage);

      // Save the updated topic with the new message
      await topic.save();

      res.status(200).json({ message: "Message sent successfully" });
    } catch (error) {
      console.error("Error sending message:", error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  }
);

// Endpoint to mark a message as read within a specific topic
app.put("/topics/:topicId/messages/read/:messageId", async (req, res) => {
  try {
    const { topicId, messageId } = req.params;

    // Find the topic by ID
    const topic = await Topic.findById(topicId);
    if (!topic) {
      return res.status(404).json({ message: "Topic not found" });
    }

    // Find the message by ID within the topic's messages
    const message = topic.groupMessages.id(messageId);
    if (!message) {
      return res.status(404).json({ message: "Message not found" });
    }

    // Mark the message as read
    message.read = true;

    // Save the updated topic with the message marked as read
    await topic.save();

    res.status(200).json({ message: "Message marked as read successfully" });
  } catch (error) {
    console.error("Error marking message as read:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// Endpoint to get all messages for a specific topic
app.get("/topics/:topicId/messages", async (req, res) => {
  try {
    const { topicId } = req.params;

    // Find the topic by ID
    const topic = await Topic.findById(topicId);
    if (!topic) {
      return res.status(404).json({ message: "Topic not found" });
    }

    // Iterate through each message and include sender's name and image URL
    const messagesWithSenderInfo = await Promise.all(
      topic.groupMessages.map(async (message) => {
        // Check if sender's info exists in the ParticipantSchema or createdBy
        let senderInfo = message.senderId
          ? topic.participants.find((participant) =>
              participant.userId.equals(message.senderId)
            )
          : null;

        // If senderInfo is still null, check if the sender is the creator of the topic
        if (!senderInfo && topic.createdBy.equals(message.senderId)) {
          senderInfo = {
            name: "Unknown", // You might want to replace this with the actual creator's name
            image: topic.imageURL, // Assuming the creator's image URL is stored in the imageURL field of the Topic model
          };
        }

        // Include sender's name and image URL in the message object
        return {
          ...message.toObject(),
          senderName: senderInfo ? senderInfo.name : "Unknown",
          senderImage: senderInfo ? senderInfo.image : null,
        };
      })
    );

    // Sort messages by timestamp in ascending order
    messagesWithSenderInfo.sort((a, b) => a.timestamp - b.timestamp);

    res.status(200).json({ messages: messagesWithSenderInfo });
  } catch (error) {
    console.error("Error retrieving messages:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// Endpoint to invite friends to a topic
app.post("/invite-topic/:topicId", async (req, res) => {
  const { topicId } = req.params;
  const { invitedFriends } = req.body;
  try {
    // Fetch topic by ID
    const topic = await Topic.findById(topicId);
    if (!topic) {
      return res.status(404).json({ message: "Topic not found" });
    }

    // Ensure invitedFriends is an array
    if (!Array.isArray(invitedFriends)) {
      return res
        .status(400)
        .json({ message: "Invited friends should be an array" });
    }

    // Add invited friends to the topic participants
    for (const friendId of invitedFriends) {
      const friend = await User.findById(friendId);
      if (friend) {
        topic.participants.push({
          userId: friend._id,
          name: friend.name,
          image: friend.image,
        });
      }
    }

    // Save the updated topic
    await topic.save();

    res.status(200).json({ message: "Friends invited to topic successfully" });
  } catch (error) {
    console.error("Error inviting friends to topic:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// API to add image URL to the topic
app.post(
  "/add-image-to-topic/:topicId",
  uploads.single("image"),
  async (req, res) => {
    try {
      const { topicId } = req.params;
      const image = req.file ? req.file.path : null;
      const imageUrl = image;

      // Find the topic by ID
      const topic = await Topic.findById(topicId);

      // If topic not found, return error
      if (!topic) {
        return res.status(404).json({ message: "Topic not found" });
      }

      // Add image URL to the topic
      topic.imageURL = imageUrl;

      // Save the updated topic
      await topic.save();

      res.status(200).json({ message: "Image added to topic successfully" });
    } catch (error) {
      console.error("Error adding image to topic:", error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  }
);

// Endpoint to fetch topics associated with a user
app.get("/user-topics/:userId", async (req, res) => {
  const { userId } = req.params;

  try {
    // Find topics where createdBy matches userId or participants contains userId
    const topics = await Topic.find({
      $or: [{ createdBy: userId }, { "participants.userId": userId }],
    }).select("topicName imageURL");

    res.status(200).json({ topics });
  } catch (error) {
    console.error("Error fetching user topics:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// Endpoint to get topic name and imageURL by ID
app.get("/topics/:topicId/details", async (req, res) => {
  const { topicId } = req.params;

  try {
    // Find the topic by ID
    const topic = await Topic.findById(topicId)
      .select("topicName imageURL")
      .exec();
    if (!topic) {
      return res.status(404).json({ message: "Topic not found" });
    }

    // Extract topic name and imageURL
    const { topicName, imageURL } = topic;

    res.status(200).json({ topicName, imageURL });
  } catch (error) {
    console.error("Error fetching topic details:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// Endpoint api to fetch the mentors
app.get("/mentors", async (req, res) => {
  try {
    // Find all users where mentor is true
    const mentors = await User.find(
      { mentor: true },
      {
        _id: true,
        name: true,
        image: true,
        Headline: true,
      }
    );

    if (!mentors.length) {
      return res.status(200).json({ message: "No mentors found" });
    }

    // Return success response with mentor details
    res.status(200).json({ mentors });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// Endpoint api to fetch all the students details :)
app.get("/students", async (req, res) => {
  try {
    // Find all users where student is true
    const students = await User.find(
      { Student: true },
      {
        _id: true,
        name: true,
        image: true,
        Headline: true,
      }
    );

    if (!students.length) {
      return res.status(200).json({ message: "No students found" });
    }

    // Return success response with student details
    res.status(200).json({ students });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// Endpoint to check if the current user is a friend of the profile viewing user
app.get("/check-friendship/:currentUserId/:profileUserId", async (req, res) => {
  try {
    const { currentUserId, profileUserId } = req.params;

    // Find the profile viewing user
    const profileUser = await User.findById(profileUserId);

    // Check if the profile viewing user's friends list contains the current user
    const isFriend = profileUser.friends.includes(currentUserId);

    // Check if the current user has sent a friend request to the profile viewing user
    const sentRequest = profileUser.friendRequests.includes(currentUserId);

    // Check if the current user has a friend request from the profile viewing user
    const receivedRequest =
      profileUser.sentFriendRequests.includes(currentUserId);

    let status = "not_friends";

    // Determine the relationship status
    if (isFriend) {
      status = "friends";
    } else if (sentRequest) {
      status = "request_sent";
    } else if (receivedRequest) {
      status = "accept_request";
    }

    // Return the relationship status
    res.json({ status });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.post("/add-social-media/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const { linkedIn, instagram, facebook, twitter } = req.body;

    // Validate userId
    if (!userId) {
      return res.status(400).json({ error: "userId is required" });
    }

    // Check if the user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Update user document with social media URLs
    user.socialMedia = {
      linkedIn: linkedIn || "",
      instagram: instagram || "",
      facebook: facebook || "",
      twitter: twitter || "",
    };

    // Save the updated user document
    await user.save();

    // Return success response
    res.status(200).json({ message: "Social media URLs added successfully" });
  } catch (error) {
    console.error("Error adding social media URLs:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Endpoint API to remove connections
app.post("/remove-friend", async (req, res) => {
  const { userId, friendId } = req.body;

  try {
    // Remove friend from the user's friend list
    await User.updateOne({ _id: userId }, { $pull: { friends: friendId } });

    // Remove user from the friend's friend list
    await User.updateOne({ _id: friendId }, { $pull: { friends: userId } });

    res.status(200).json({ message: "Friend removed successfully" });
  } catch (error) {
    console.error("Error removing friend:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Endpoint to reject a friend request
app.post("/reject-friend-request", async (req, res) => {
  const { userId, senderId } = req.body;

  try {
    // Find the recipient user and remove the sender from their friendRequests array
    await User.findByIdAndUpdate(userId, {
      $pull: { friendRequests: senderId },
    });

    // Find the sender user and remove the recipient from their sentFriendRequests array
    await User.findByIdAndUpdate(senderId, {
      $pull: { sentFriendRequests: userId },
    });

    res.status(200).json({ message: "Friend request rejected successfully" });
  } catch (error) {
    console.error("Error rejecting friend request:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// endpoint api to get user name and image only
app.get("/:userId/image", async (req, res) => {
  try {
    const userId = req.params.userId;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json({ name: user.name, image: user.image });
  } catch (error) {
    console.error("Error fetching user name:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Endpoint to get user type
app.get("/user-type/:userId", async (req, res) => {
  try {
    const userId = req.params.userId;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isMentor = user.mentor;
    const isStudent = user.Student;

    res.status(200).json({ isMentor, isStudent });
  } catch (error) {
    console.error("Error checking user type:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// Endpoint to fetch all sessions with details including organizer's name
app.get("/recommended-sessions", async (req, res) => {
  try {
    const sessions = await GroupSession.find({ ended: false })
      .populate("createdBy", "name image")
      .select(
        "sessionName banner date createdBy description time duration public private _id"
      );

    // If no sessions found, return a message
    if (!sessions.length) {
      return res.status(404).json({ message: "No recommended sessions found" });
    }

    // Return the recommended sessions
    res.status(200).json({ sessions });
  } catch (error) {
    console.error("Error fetching recommended sessions:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Endpoint to fetch attendee status
app.get("/attendee-status/:sessionId/:userId", async (req, res) => {
  try {
    const { sessionId, userId } = req.params;

    // Find the session by ID
    const session = await GroupSession.findById(sessionId);

    // If session not found, return error
    if (!session) {
      return res.status(404).json({ error: "Session not found" });
    }

    // Find the attendee in the session
    const attendee = session.attendees.find(
      (attendee) => String(attendee.userId) === userId
    );

    // Determine the status
    const status = attendee ? attendee.status : "none";

    // Return the session ID, user ID, and status
    res.json({ sessionId, userId, status });
  } catch (error) {
    console.error("Error fetching attendee status:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Endpoint API to search for users
app.post("/users/search", async (req, res) => {
  try {
    const { searchString } = req.body;

    // Check if search string is provided in the request body
    if (!searchString) {
      return res
        .status(400)
        .json({ error: "Search string is required in the request body" });
    }

    // Perform case-insensitive search using regular expression
    const users = await User.aggregate([
      {
        $match: {
          name: { $regex: new RegExp("^" + searchString, "i") },
        },
      },
      {
        $project: {
          // Project only the required fields
          _id: 1,
          name: 1,
          image: 1,
          Headline: 1,
        },
      },
    ]);

    res.json(users);
  } catch (error) {
    console.error("Error searching users:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Endpoint to get topics with participation status
app.get("/topics", async (req, res) => {
  try {
    const topics = await Topic.find();

    // Map each topic to the required format with participation status
    const formattedTopics = await Promise.all(
      topics.map(async (topic) => {
        const participant = await Participant.findOne({
          userId: req.query.userId,
          _id: { $in: topic.participants.map((p) => p.userId) },
        });
        const participating = participant ? true : false;
        return {
          name: topic.topicName,
          imageURL: topic.imageURL,
          totalParticipants: topic.participants.length,
          isPublic: topic.isPublic,
          participating: participating,
        };
      })
    );

    res.status(200).json(formattedTopics);
  } catch (error) {
    console.error("Error fetching topics:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Endpoint to check if a user is participating in a topic
app.put("/topics/:topicId/participants/:userId", async (req, res) => {
  const { topicId, userId } = req.params;

  try {
    const topic = await Topic.findById(topicId);
    if (!topic) {
      return res.status(404).json({ message: "Topic not found" });
    }

    const participant = topic.participants.find((p) => p.userId === userId);
    if (participant) {
      return res.json({ participating: true });
    } else {
      return res.json({ participating: false });
    }
  } catch (error) {
    console.error("Error checking participation:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

// Endpoint to fetch all members
app.get("/members", async (req, res) => {
  try {
    // Find all users with specified fields
    const members = await User.find(
      {},
      { _id: true, name: true, image: true, Headline: true }
    );

    if (!members.length) {
      return res.status(200).json({ message: "No members found" });
    }

    // Return success response with all member details
    res.status(200).json({ members });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// Endpoint to fetch session details by session ID and user ID
app.get("/:sessionId", async (req, res) => {
  const { sessionId } = req.params;

  try {
    // Find the session by session ID and populate the createdBy field with name and image
    const session = await GroupSession.findById(sessionId).populate(
      "createdBy",
      "name image"
    );

    if (!session) {
      return res.status(404).json({ message: "Session not found" });
    }

    // Return session details
    res.json({ session });
  } catch (error) {
    console.error("Error fetching session details:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});
