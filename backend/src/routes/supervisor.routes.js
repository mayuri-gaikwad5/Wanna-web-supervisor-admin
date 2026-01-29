const express = require("express");
const router = express.Router();
const Joi = require("joi");
const Supervisor = require("../models/supervisor");
const { authMiddleware } = require("../middleware/authMiddleware");

/**
 * 1. POST /supervisor/register
 * Initial signup - region is left empty for Step 2 onboarding.
 */
router.post("/register", async (req, res) => {
  const schema = Joi.object({
    name: Joi.string().trim().required(),
    email: Joi.string().email().required(),
    firebaseUid: Joi.string().required(),
  });

  const { error, value } = schema.validate(req.body);
  if (error) return res.status(400).json({ message: error.message });

  try {
    const { name, email, firebaseUid } = value;

    const existing = await Supervisor.findOne({
      $or: [{ email }, { firebaseUid }],
    });

    if (existing) {
      return res.status(409).json({ message: "Supervisor already exists" });
    }

    const supervisor = await Supervisor.create({
      name,
      email,
      firebaseUid,
      region: "", //
      role: "supervisor",
      isApproved: false,
    });

    res.status(201).json({ message: "Identity created. Complete profile in Step 2.", supervisor });
  } catch (err) {
    console.error("❌ Signup Error:", err.message);
    res.status(500).json({ message: "Internal server error" });
  }
});

/**
 * 2. GET /supervisor/status/:uid
 * Used by ProtectedRoute to determine if the user needs to select a region.
 */
router.get("/status/:uid", async (req, res) => {
  try {
    const { uid } = req.params;
    const supervisor = await Supervisor.findOne({ firebaseUid: uid });

    if (!supervisor) {
      return res.status(404).json({ message: "Supervisor not found" });
    }

    res.status(200).json({
      role: supervisor.role,
      region: supervisor.region, // If empty, frontend redirects to /complete-profile
      isApproved: supervisor.isApproved,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error checking status" });
  }
});

/**
 * 3. PATCH /supervisor/complete-profile
 * Triggered when supervisor selects a region (e.g., Solapur) and clicks Submit.
 */
router.patch("/complete-profile", authMiddleware, async (req, res) => {
  try {
    const { region } = req.body;
    // CRITICAL: Ensure your authMiddleware attaches the Firebase UID to req.user.uid
    const firebaseUid = req.user.uid; 

    if (!region) {
      return res.status(400).json({ message: "Region selection is required" });
    }

    console.log(`🛠️ Attempting to update UID: ${firebaseUid} with Region: ${region}`);

    // Update the record so the Solapur Admin can finally see it
    const supervisor = await Supervisor.findOneAndUpdate(
      { firebaseUid: firebaseUid }, 
      { 
        region: region, 
        isApproved: false,
        status: "pending" 
      },
      { new: true }
    );

    if (!supervisor) {
      console.log("❌ No MongoDB record found for Firebase UID:", firebaseUid);
      return res.status(404).json({ message: "Supervisor record not found in MongoDB." });
    }

    console.log("✅ MongoDB Updated Successfully for:", supervisor.email);
    res.status(200).json({ message: "Profile updated, request sent to Admin.", supervisor });
  } catch (err) {
    console.error("❌ Profile update error:", err.message);
    res.status(500).json({ message: "Server error during profile update" });
  }
});

/**
 * 4. GET /supervisor/profile
 * Returns full profile data for the dashboard.
 */
router.get("/profile", authMiddleware, async (req, res) => {
  try {
    const firebaseUid = req.user.uid;
    const supervisor = await Supervisor.findOne({ firebaseUid });

    if (!supervisor) {
      return res.status(404).json({ message: "Supervisor not found" });
    }

    res.status(200).json(supervisor);
  } catch (err) {
    res.status(500).json({ message: "Server error fetching profile" });
  }
});

module.exports = router;