const express = require("express");
const router = express.Router();

const Admin = require("../models/admin");
const Supervisor = require("../models/supervisor");

/**
 * GET /auth/status/:uid
 * Resolve role, region & approval status
 */
router.get("/status/:uid", async (req, res) => {
  try {
    const firebaseUid = req.params.uid;

    console.log("=================================");
    console.log("Incoming UID:", firebaseUid);

    // 1️⃣ ADMIN CHECK
    const admin = await Admin.findOne({ firebaseUid });

    console.log("Admin Found:", admin);

    if (admin) {
      return res.status(200).json({
        role: "admin",
        isApproved: true,
        email: admin.email,
        region: admin.region,
      });
    }

    // 2️⃣ SUPERVISOR CHECK
    const supervisor = await Supervisor.findOne({ firebaseUid });

    console.log("Supervisor Found:", supervisor);

    if (supervisor) {
      return res.status(200).json({
        role: "supervisor",
        isApproved: supervisor.isApproved,
        email: supervisor.email,
        region: supervisor.region,
      });
    }

    console.log("❌ No user found for UID:", firebaseUid);

    console.error(
      `User authenticated in Firebase but missing in MongoDB. UID: ${firebaseUid}`
    );
  } catch (error) {
    console.error("❌ Auth status error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
