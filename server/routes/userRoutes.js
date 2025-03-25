const express = require("express");
const router = express.Router();
const {
    getUsers,
    getMe,
    registerUser,
    loginUser,
    logoutUser,
    googleauth,
    googleCallback,
} = require("../controllers/userController");

// Public routes
router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/logout", logoutUser);

// Google OAuth routes
router.get("/google", googleauth);
router.get("/google/callback", googleCallback);

// Protected routes
router.get("/me", getMe);
router.get("/", getUsers);

module.exports = router; 