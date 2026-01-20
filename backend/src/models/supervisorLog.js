const mongoose = require("mongoose");

const supervisorLogSchema = new mongoose.Schema({
  supervisorUid: { type: String, required: true },
  email: { type: String, required: true },

  eventType: {
    type: String,
    enum: ["login", "logout", "action"],
    required: true,
  },

  actionDescription: { type: String, default: "" },

  region: { type: String, required: true },

  timestamp: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("SupervisorLog", supervisorLogSchema);
