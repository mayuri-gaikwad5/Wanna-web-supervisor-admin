const express = require("express");
const router = express.Router();
const SupervisorLog = require("../models/supervisorLog");
const { authMiddleware } = require("../middleware/authMiddleware");

router.post("/create", authMiddleware, async (req, res) => {
  try {
    // 🚫 DO NOT LOG ADMINS
    if (req.user.role !== "supervisor") {
      return res.status(200).json({ message: "Admin logs ignored" });
    }

    const { eventType, actionDescription } = req.body;

    await SupervisorLog.create({
      supervisorUid: req.user.uid,
      email: req.user.email,
      region: req.user.region,
      eventType,
      actionDescription,
    });

    res.status(201).json({ message: "Supervisor log created" });
  } catch (err) {
    console.error("Log error:", err.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

router.get("/region", authMiddleware, async (req, res) => {
  try {
    // 🔐 Only admin allowed
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied" });
    }

    const logs = await SupervisorLog.find({
      region: req.user.region,
      eventType: { $in: ["login", "logout", "action"] }, // optional
    }).sort({ timestamp: -1 });

    res.json(logs);
  } catch (err) {
    console.error("Fetch logs error:", err.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

module.exports = router;
