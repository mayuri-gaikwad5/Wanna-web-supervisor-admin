const express = require("express");
const router = express.Router();
const Supervisor = require("../models/supervisor");

/**
 * GET pending supervisors (REGION-WISE)
 */
router.get("/supervisors/pending", async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied" });
    }

    const adminRegion = req.user.region;

    const pendingSupervisors = await Supervisor.find({
      role: "supervisor",
      isApproved: false,
      region: adminRegion, // Admin only sees requests for their own region
    }).select("-__v");

    res.status(200).json(pendingSupervisors);
  } catch (err) {
    console.error("Fetch pending supervisors error:", err.message);
    res.status(500).json({ message: "Failed to fetch pending supervisors" });
  }
});

/**
 * GET approved supervisors (REGION-WISE)
 */
router.get("/supervisors/approved", async (req, res) => {
  try {
    if (req.user.role !== "admin")
      return res.status(403).json({ message: "Access denied" });

    const supervisors = await Supervisor.find({
      region: req.user.region,
      isApproved: true,
    });

    res.json(supervisors);
  } catch (err) {
    console.error("Fetch approved supervisors error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/**
 * REVOKE supervisor access (WITH PROFILE RESET)
 */
router.patch("/supervisors/:id/revoke", async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied" });
    }

    const supervisor = await Supervisor.findById(req.params.id);
    if (!supervisor) {
      return res.status(404).json({ message: "Supervisor not found" });
    }

    if (supervisor.region !== req.user.region) {
      return res.status(403).json({ message: "You cannot revoke supervisors from another region" });
    }

    // 🔥 THE CRITICAL CHANGE: Clear the region
    // This pushes them back to the onboarding step in the frontend logic
    supervisor.isApproved = false;
    supervisor.region = ""; 
    await supervisor.save();

    res.json({ message: "Supervisor access revoked and profile reset successfully", supervisor });
  } catch (err) {
    console.error("Revoke/Reset error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
});

/**
 * APPROVE supervisor
 */
router.patch("/supervisors/:id/approve", async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied" });
    }

    const supervisor = await Supervisor.findById(req.params.id);

    if (!supervisor) {
      return res.status(404).json({ message: "Supervisor not found" });
    }

    if (supervisor.region !== req.user.region) {
      return res.status(403).json({
        message: "You cannot approve supervisors from another region",
      });
    }

    supervisor.isApproved = true;
    await supervisor.save();

    res.status(200).json({
      message: "Supervisor approved successfully",
      supervisor,
    });
  } catch (err) {
    console.error("Approve supervisor error:", err.message);
    res.status(500).json({ message: "Approval failed" });
  }
});

module.exports = router;