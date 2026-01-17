const express = require("express");
const router = express.Router();
const Joi = require("joi");
const Supervisor = require("../models/supervisor");
const { authMiddleware } = require("../middleware/authMiddleware");

/**
 * POST /supervisor/register
 */
router.post("/register", async (req, res) => {
  console.log("✅ SUPERVISOR REGISTER HIT", req.body);

  const schema = Joi.object({
    name: Joi.string().trim().required(),
    email: Joi.string().email().required(),
    firebaseUid: Joi.string().required(),
    region: Joi.string().required(),
  });

  const { error, value } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.message });
  }

  try {
    const { name, email, firebaseUid, region } = value;

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
      region,
      role: "supervisor",
      isApproved: false,
    });

    res.status(201).json({
      message: "Supervisor registered. Awaiting admin approval.",
      supervisor,
    });
  } catch (err) {
    console.error("❌ Supervisor Signup Error:", err.message);
    res.status(500).json({ message: "Internal server error" });
  }
});

/**
 * GET /supervisor/profile
 */
router.get("/profile", authMiddleware, async (req, res) => {
  try {
    const firebaseUid = req.user.uid;

    const supervisor = await Supervisor.findOne({ firebaseUid });

    if (!supervisor) {
      return res.status(404).json({ message: "Supervisor not found" });
    }

    res.status(200).json({
      name: supervisor.name,
      email: supervisor.email,
      region: supervisor.region,
      role: supervisor.role,
      isApproved: supervisor.isApproved,
    });
  } catch (err) {
    console.error("❌ Fetch supervisor profile error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
