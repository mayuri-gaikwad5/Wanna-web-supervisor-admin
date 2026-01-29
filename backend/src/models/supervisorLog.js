const mongoose = require("mongoose");

const supervisorLogSchema = new mongoose.Schema({
  // Using supervisorUid to match your schema preference
  supervisorUid: { type: String, required: true }, 
  email: { type: String, required: true },

  eventType: {
    type: String,
    enum: ["login", "logout", "action"],
    required: true,
  },

  actionDescription: { type: String, default: "" },

  // Region is required so the Solapur Admin can filter this log
  region: { type: String, required: true },

  timestamp: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("SupervisorLog", supervisorLogSchema);