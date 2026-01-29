const admin = require("../configuration/firebaseConfig");
const Admin = require("../models/admin");
const Supervisor = require("../models/supervisor");

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "No token provided" });
    }

    const token = authHeader.split(" ")[1];
    const decodedToken = await admin.auth().verifyIdToken(token);

    // 1. Check for Admin
    const adminUser = await Admin.findOne({ firebaseUid: decodedToken.uid });

    if (adminUser) {
      req.user = {
        uid: decodedToken.uid,
        email: decodedToken.email,
        role: "admin",
        region: adminUser.region,
      };
      return next();
    }

    // 2. Check for Supervisor
    const supervisor = await Supervisor.findOne({ firebaseUid: decodedToken.uid });

    if (!supervisor) {
      return res.status(404).json({ message: "Account not found" });
    }

    // 🔥 REMOVED: !supervisor.isApproved check. 
    // We let them pass so they can reach the /complete-profile route.

    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email,
      role: "supervisor",
      region: supervisor.region,
      isApproved: supervisor.isApproved, // Pass this flag to the route
    };

    console.log("✅ Authenticated user:", req.user);
    next();
  } catch (error) {
    console.error("❌ Auth middleware error:", error.message);
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

module.exports = { authMiddleware };