const mongoose = require("mongoose");
require('dotenv').config();

const dbUri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/wanawebdb";

mongoose.connect(dbUri, {
    serverSelectionTimeoutMS: 5000,
}).then(() => {
    console.log("Connected to MongoDB");
}).catch((err) => {
    console.error("MongoDB connection error:", err);
});

// Add this line to stop the "buffering" hanging
mongoose.set('bufferCommands', false);

module.exports = mongoose;