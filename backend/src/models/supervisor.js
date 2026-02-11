const mongoose = require("mongoose");

const supervisorSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    firebaseUid: {
      type: String,
      required: true,
      unique: true,
    },
    region: {
      type: String,
      default: "", // Changed from required: true to support the two-step flow
      index: true, 
    },
    role: {
      type: String,
      enum: ["supervisor"],
      default: "supervisor",
    },
    isApproved: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Supervisor", supervisorSchema);