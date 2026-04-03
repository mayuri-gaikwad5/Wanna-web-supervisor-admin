const express = require("express");
const cors = require("cors");
require("dotenv").config();

const connectDB = require("./configuration/dbConfig");
const { authMiddleware } = require("./middleware/authMiddleware");
const { startEventCleanupJob } = require("./jobs/eventCleanupJob");

// Routes
const authRoutes = require("./routes/auth.routes");
const adminRoutes = require("./routes/admin.routes");
const supervisorRoutes = require("./routes/supervisor.routes");
const logsRoutes = require("./routes/logs.routes");
const cleanupRoutes = require("./routes/cleanup.routes");
const eventsRoutes = require("./routes/events.routes");
const createAdmin = require("./scripts/createAdmin");

const app = express();

app.use(cors());
app.use(express.json());

// Public
app.use("/auth", authRoutes);

// Protected
app.use("/admin", authMiddleware, adminRoutes);
app.use("/supervisor", supervisorRoutes);
app.use("/logs", logsRoutes);
app.use("/cleanup", authMiddleware, cleanupRoutes);
app.use("/events", eventsRoutes);
// Start server
connectDB().then(async () => {
  await createAdmin();

  // Start the event cleanup job
  startEventCleanupJob();

  app.listen(3000, () => {
    console.log("DEBUG MONGO_URI =", process.env.MONGO_URI);
    console.log("Server running on port 3000");
  });
});
