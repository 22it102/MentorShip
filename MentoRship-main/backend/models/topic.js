const mongoose = require("mongoose");

// Define schema for participants within a topic
const ParticipantSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    required: true,
  },
});

// Define schema for topics
const TopicSchema = new mongoose.Schema({
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  topicName: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  careerGoals: {
    type: [String],
    required: true,
  },
  isPublic: {
    type: Boolean,
    default: false,
  },
  participants: {
    type: [ParticipantSchema],
    default: [],
  },
  imageURL: {
    type: String,
  },
  groupMessages: [
    {
      senderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      messageType: {
        type: String,
        enum: ["text", "image"],
        default: "text",
      },
      message: String,
      timestamp: {
        type: Date,
        default: Date.now,
      },
      imageUrl: String,
      sent: {
        type: Boolean,
        default: true,
      },
      read: {
        type: Boolean,
        default: false,
      },
    },
  ],
});

const Topic = mongoose.model("Topic", TopicSchema);
const Participant = mongoose.model("Participant", ParticipantSchema);

module.exports = { Topic, Participant };
