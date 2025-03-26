const express = require("express");
const passport = require("passport");
const {
    getUsers,
    getMe,
    registerUser,
    loginUser,
    logoutUser,
} = require("../controllers/userController");

const router = express.Router();

// Public Routes
router.get("/", getUsers);
router.get("/me", getMe);
router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/logout", logoutUser);

// Google OAuth routes
router.get("/google", 
    passport.authenticate("google", { 
        scope: ["profile", "email"],
        prompt: "select_account"
    })
);

router.get("/google/callback", 
    passport.authenticate("google", { failureRedirect: "/login" }),
    (req, res) => {
        res.redirect("http://localhost:3000");
    }
);

module.exports = router;
