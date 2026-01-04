const admin = require("firebase-admin");
// Import the JSON file you downloaded from Firebase Console
const serviceAccount = require("./serviceAccountKey.json"); 

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

// Export the admin object so the middleware can use it
module.exports = admin;