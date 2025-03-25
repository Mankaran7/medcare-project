const express = require("express");
const {
    getUsers,
    getMe,
    registerUser,
    loginUser,
    logoutUser,
    googleauth,
    googleCallback,
} = require("../controllers/userController");


const router = express.Router();

// Public Routes
router.get("/", getUsers);
router.get("/me", getMe);
router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/logout", logoutUser);
router.get("/google", googleauth);
router.get("/google/callback", googleCallback);

module.exports = router;
