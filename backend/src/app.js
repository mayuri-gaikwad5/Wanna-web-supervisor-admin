const express = require("express");
const cors = require("cors");
require("dotenv").config();

const connectDB = require("./configuration/dbConfig");
const { authMiddleware } = require("./middleware/authMiddleware");

// Routes
const authRoutes = require("./routes/auth.routes");
const adminRoutes = require("./routes/admin.routes");
const supervisorRoutes = require("./routes/supervisor.routes");

const createAdmin = require("./scripts/createAdmin");

const app = express();

app.use(cors());
app.use(express.json());

// Public
app.use("/auth", authRoutes);

// Protected
app.use("/admin", authMiddleware, adminRoutes);
app.use("/supervisor", supervisorRoutes);

// Start server
connectDB().then(() => {
  createAdmin();

  app.listen(3000, () => {
    console.log("DEBUG MONGO_URI =", process.env.MONGO_URI);
    console.log("Server running on port 3000");
  });
});
