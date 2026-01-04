const admin = require('../configuration/firebaseConfig');
const User = require('../models/user'); // Import your MongoDB User model

const verifyFirebaseToken = async (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: "No token provided" });
    }

    const token = authHeader.split(' ')[1];

    try {
        const decodedToken = await admin.auth().verifyIdToken(token);
        
        // Find the user in MongoDB to check approval status
        const mongoUser = await User.findOne({ firebaseUid: decodedToken.uid });

        if (!mongoUser) {
            return res.status(404).json({ message: "User not found in database" });
        }

        if (!mongoUser.isApproved) {
            return res.status(403).json({ message: "Account pending admin approval" });
        }

        req.user = {
            uid: decodedToken.uid,
            email: decodedToken.email,
            role: mongoUser.role // Attach the role from MongoDB
        };
        
        next();
    } catch (error) {
        console.error("Firebase Token Verification Error:", error);
        return res.status(403).json({ message: "Invalid or expired token" });
    }
};

module.exports = { verifyFirebaseToken };