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

router.get("/", getUsers);
router.get("/me", getMe);

// Apply middlewares in sequence with proper error handling
router.post("/register", registerUser

);

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
    passport.authenticate("google", { failureRedirect: "http://localhost:3000/login" }),
    (req, res) => {
        // Ensure user is set in session
        if (req.user) {
            req.session.save((err) => {
                if (err) {
                    console.error("Session save error:", err);
                    return res.redirect("http://localhost:3000/login");
                }
                res.redirect("http://localhost:3000/auth/google/callback");
            });
        } else {
            res.redirect("http://localhost:3000/login");
        }
    }
);

module.exports = router;