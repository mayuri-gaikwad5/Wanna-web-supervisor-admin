

const express = require("express");
const router = express.Router();
const Supervisor = require("../models/supervisor");

/**
 * GET all pending supervisors
 * URL: /admin/supervisors/pending
 */
router.get("/supervisors/pending", async (req, res) => {
  try {
    // Only admins should reach here (middleware already checks role)
    const pendingSupervisors = await Supervisor.find({
      role: "supervisor",
      isApproved: false,
    }).select("-__v");

    res.status(200).json(pendingSupervisors);
  } catch (err) {
    console.error("Fetch pending supervisors error:", err.message);
    res.status(500).json({ message: "Failed to fetch pending supervisors" });
  }
});

/**
 * APPROVE supervisor
 * URL: /admin/supervisors/:id/approve
 */
router.patch("/supervisors/:id/approve", async (req, res) => {
  try {
    const supervisorId = req.params.id;

    const updated = await Supervisor.findByIdAndUpdate(
      supervisorId,
      { isApproved: true },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "Supervisor not found" });
    }

    res.status(200).json({
      message: "Supervisor approved successfully",
      supervisor: updated,
    });
  } catch (err) {
    console.error("Approve supervisor error:", err.message);
    res.status(500).json({ message: "Approval failed" });
  }
});

module.exports = router;
