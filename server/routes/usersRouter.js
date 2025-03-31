const express = require("express");
const passport = require("passport");
const {
    getUsers,
    getMe,
    registerUser,
    loginUser,
    logoutUser,
} = require("../controllers/userController");
const validateEmailDomain = require("../middleware/emailValidator");
const router = express.Router();

// Debug middleware
const debugMiddleware = (req, res, next) => {
    console.log('Debug - Registration Request:', {
        body: req.body,
        method: req.method,
        path: req.path,
        headers: req.headers['content-type']
    });
    next();
};

// Ensure middleware completes
const ensureResponse = (req, res, next) => {
    if (res.headersSent) {
        console.log('Response already sent, stopping middleware chain');
        return;
    }
    next();
};

// Public Routes
router.get("/", getUsers);
router.get("/me", getMe);

// Apply middlewares in sequence with proper error handling
router.post("/register", 
    debugMiddleware,
    validateEmailDomain,
    ensureResponse,
    registerUser
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