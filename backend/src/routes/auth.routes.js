const express = require("express");
const router = express.Router();

const Admin = require("../models/admin");
const Supervisor = require("../models/supervisor");

/**
 * GET /auth/status/:uid
 * Resolve role & approval status
 */
router.get("/status/:uid", async (req, res) => {
  try {
    const firebaseUid = req.params.uid;

    // 1️⃣ Check Admin FIRST
    const admin = await Admin.findOne({ firebaseUid });

    if (admin) {
      return res.status(200).json({
        role: "admin",
        isApproved: true,
        email: admin.email,
        region: admin.region,
      });
    }

    // 2️⃣ Check Supervisor
    const supervisor = await Supervisor.findOne({ firebaseUid });

    if (supervisor) {
      return res.status(200).json({
        role: "supervisor",
        isApproved: supervisor.isApproved,
        email: supervisor.email,
        region: supervisor.region,
      });
    }

    // 3️⃣ Not found
    return res.status(404).json({ message: "Account not found" });
  } catch (error) {
    console.error("Auth status error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
