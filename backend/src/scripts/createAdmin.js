const Admin = require("../models/admin");

async function createAdmin() {
  const admins = [
    {
      name: "WANA Solapur Admin",
      email: "admin.solapur@wana.com",
      firebaseUid: "QXycBZ5j9zMa9prErOuFK5auQxF2",
      region: "Solapur",
    },
    {
      name: "WANA Pune Admin",
      email: "admin.pune@wana.com",
      firebaseUid: "D2pT46Tg5egmJQxEjEgaYM3rT6z2",
      region: "Pune",
    },
  ];

  for (const adminData of admins) {
    // 🔥 CHECK BY REGION (NOT EMAIL)
    const exists = await Admin.findOne({ region: adminData.region });

    if (exists) {
      console.log(
        `✅ Admin already exists for region: ${adminData.region}`
      );
      continue;
    }

    await Admin.create({
      name: adminData.name,
      email: adminData.email,
      firebaseUid: adminData.firebaseUid,
      region: adminData.region,
      role: "admin",
    });

    console.log(
      `✅ Admin created: ${adminData.email} (${adminData.region})`
    );
  }
}

module.exports = createAdmin;
