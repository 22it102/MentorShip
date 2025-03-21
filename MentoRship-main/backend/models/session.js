const mongoose = require("mongoose");
const attendeeSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  name: {
    type: String,
  },
  image: {
    type: String,
  },
  status: {
    type: String,
    enum: ["attending", "pending", "rejected", "none"],
    default: "none",
  },
});

const groupSessionSchema = new mongoose.Schema({
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  attendees: {
    type: [attendeeSchema],
    default: [],
  },
  sessionName: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  careerGoals: {
    type: [String],
    default: [],
  },
  public: {
    type: Boolean,
    default: true,
  },
  banner: {
    type: String,
    default: "",
  },
  bannerAltText: String,
  date: {
    type: Date,
  },
  time: {
    type: String,
  },
  duration: {
    type: Number,
  },
  started: {
    type: Boolean,
    default: false,
  },
  ended: {
    type: Boolean,
    default: false,
  },
  meetLink: String,
  attendeesVisibleMeetLink: {
    type: Boolean,
    default: false,
  },
});

const GroupSession = mongoose.model("GroupSession", groupSessionSchema);

module.exports = GroupSession;
