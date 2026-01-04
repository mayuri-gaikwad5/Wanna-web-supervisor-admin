const express = require('express');
const cors = require('cors');
const mongoose = require('./configuration/dbConfig'); 

// Import Routes
const signupRoute = require('./routes/signup');       
const authRoute = require('./routes/auth'); 
const userRoute = require('./routes/user');           
const sosRoute = require('./routes/sos');
const eventsRoute = require('./routes/events');

// 1. Import the new Firebase Middleware (Step 4)
const { verifyFirebaseToken } = require('./middleware/authMiddleware');

// Import Admin Script
const createAdminAccount = require('./scripts/admin');

const app = express();
const port = 3000;

// Middleware
app.use(cors()); 
app.use(express.json()); 
app.use(express.urlencoded({ extended: true })); 

// --- Routes ---

// Public Routes: No token required to register or check status
app.use('/user', signupRoute);            
app.use('/auth', authRoute);              

// 2. Protected Routes: verifyFirebaseToken is added here (Step 4)
// These routes now require a 'Bearer <token>' in the Authorization header
app.use('/user-management', verifyFirebaseToken, userRoute);   
app.use('/sos', verifyFirebaseToken, sosRoute);
app.use('/events', verifyFirebaseToken, eventsRoute);

// Error Handling Middleware (Catches 404s)
app.use((req, res) => {
    console.log(`404 - Not Found: ${req.method} ${req.url}`);
    res.status(404).json({ message: "Route not found on server" });
});

// CRITICAL FIX: Ensure DB is connected before starting server
mongoose.connection.once('open', () => {
    console.log("Connected to MongoDB");
    
    // Automatically creates/verifies the hardcoded Admin
    createAdminAccount();

    app.listen(port, () => {
        console.log(`Server is running on port ${port}`);
    });
});

// Handle connection errors globally
mongoose.connection.on('error', (err) => {
    console.error("MongoDB connection error:", err);
});