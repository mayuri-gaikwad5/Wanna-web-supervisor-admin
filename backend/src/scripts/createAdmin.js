const Admin = require("../models/admin");

async function createAdmin() {
  const adminEmail = "admin@wana.com";
  const adminUid = "owoeuOPnRxbUmru7cKEEUcbl1nA3"; // Firebase UID
  const adminRegion = "Solapur"; // MUST match your system region

  const exists = await Admin.findOne({ email: adminEmail });

  if (exists) {
    console.log("✅ Admin already exists");
    return;
  }

  const admin = await Admin.create({
    name: "WANA Admin",
    email: adminEmail,
    firebaseUid: adminUid,
    region: adminRegion,
    role: "admin"
  });

  console.log("✅ Admin created successfully", admin.email);
}

module.exports = createAdmin;
