const express = require('express');
const router = express.Router();
const User = require('../models/user');

/**
 * @route   GET /auth/status/:uid
 * @desc    Check if a Firebase user is approved and get their role
 * @access  Public (Called during login)
 */
router.get('/status/:uid', async (req, res) => {
    try {
        const firebaseUid = req.params.uid;

        // Find user by firebaseUid (not _id)
        const user = await User.findOne({ firebaseUid: firebaseUid });

        if (!user) {
            console.log(`Status check failed: User ${firebaseUid} not found in MongoDB.`);
            return res.status(404).json({ message: "User not found in local database" });
        }

        // Return the approval status and role to the frontend
        res.status(200).json({
            isApproved: user.isApproved,
            role: user.role,
            email: user.email
        });
    } catch (error) {
        console.error("Error in /status check:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

module.exports = router;