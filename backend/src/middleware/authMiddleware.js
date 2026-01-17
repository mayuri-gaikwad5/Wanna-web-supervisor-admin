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

    // 🔹 CHECK ADMIN FIRST
    const adminUser = await Admin.findOne({
      firebaseUid: decodedToken.uid,
    });

    if (adminUser) {
      req.user = {
        uid: decodedToken.uid,
        email: decodedToken.email,
        role: "admin",
        region: adminUser.region,
      };
      return next();
    }

    // 🔹 THEN CHECK SUPERVISOR
    const supervisor = await Supervisor.findOne({
      firebaseUid: decodedToken.uid,
    });

    if (!supervisor) {
      return res.status(404).json({ message: "Account not found" });
    }

    if (!supervisor.isApproved) {
      return res
        .status(403)
        .json({ message: "Account pending admin approval" });
    }

    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email,
      role: "supervisor",
      region: supervisor.region,
    };

    console.log("✅ Authenticated user:", req.user);
    next();
  } catch (error) {
    console.error("❌ Auth middleware error:", error.message);
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

module.exports = { authMiddleware };
