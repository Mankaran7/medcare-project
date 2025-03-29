const bcrypt = require("bcrypt");
const passport_local = require("../config/passport-local-strategy.js");
const passport_google = require("../config/passport-google-oauth.js");
const db = require("../config/db.js");          

// @desc Get basic user data
// @route GET /api/users/
const getUsers = (req, res) => {
    res.status(200).json({
        ok: true,
        data: "Users data received",
    });
};

// @desc Get logged-in user data
// @route GET /api/users/me
const getMe = (req, res) => {
    if (req.isAuthenticated()) {
        res.json(req.user);
    } else {
        res.status(401).json({ message: "Not authenticated" });
    }
};

// @desc Register a new user
// @route POST /api/users/register
const registerUser = async (req, res) => {
    const { name, email, password } = req.body;

    try {
        // Check if user already exists
        let user = await db.oneOrNone("SELECT * FROM users WHERE user_emailid=$1", [email]);

        if (user) {
            return res.status(400).json({
                ok: false,
                message: "User already exists",
            });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPw = await bcrypt.hash(password, salt);

        // Insert new user into database
        const query =
            "INSERT INTO users(user_name, user_emailid, password) VALUES($1, $2, $3) RETURNING user_name, user_emailid, user_id;";
        const result = await db.query(query, [name, email, hashedPw]);

        // Get the first row (the newly created user)
        const newUser = result.length > 0 ? result[0] : null;

        if (!newUser) {
            return res.status(500).json({
                ok: false,
                message: "User creation failed",
            });
        }

        // Auto-login after successful registration
        req.login(newUser, (err) => {
            if (err) {
                console.error("Auto-login error:", err);
                return res.status(201).json({
                    message: "User created but auto-login failed",
                    user: newUser,
                    ok: true,
                });
            }
            return res.status(201).json({
                message: "User created and logged in",
                user: newUser,
                ok: true,
            });
        });
    } catch (error) {
        console.error("Registration error:", error);
        return res.status(500).json({
            ok: false,
            message: "Registration failed",
            error: error.message,
        });
    }
};

// @desc Login user
// @route POST /api/users/login
const loginUser = (req, res, next) => {
    passport_local.authenticate("local", (err, user, info) => {
        if (err) {
            console.log(err.message);
            return res.status(500).json({
                message: "Internal server error",
                ok: false,
            });
        }
        if (!user) {
            return res.status(401).json({
                message: info?.message || "Authentication failed",
                ok: false,
            });
        }
        req.logIn(user, (err) => {
            if (err) {
                return res.status(500).json({
                    message: "Login failed",
                    ok: false,
                });
            }
            return res.status(200).json({
                user,
                ok: true,
            });
        });
    })(req, res, next);
};

// @desc Logout user
// @route POST /api/users/logout
const logoutUser = (req, res) => {
    req.logout((err) => {
        if (err) {
            return res.status(500).json({
                message: "Logout failed",
                ok: false,
            });
        }
        res.json({ message: "Logged out successfully", ok: true });
    });
};

// @desc Google OAuth login
// @route GET /api/users/google
const googleAuth = (req, res) => {
    passport_google.authenticate("google", { 
        scope: ["profile", "email"],
        prompt: "select_account"
    })(req, res);
};

// @desc Google OAuth callback
// @route GET /api/users/google/callback
const googleCallback = (req, res, next) => {
    passport_google.authenticate("google", (err, user) => {
        if (err) {
            console.error("Google auth error:", err);
            return res.redirect("http://localhost:3000/login?error=google_auth_failed");
        }
        
        if (!user) {
            return res.redirect("http://localhost:3000/login?error=no_user");
        }

        req.logIn(user, (err) => {
            if (err) {
                console.error("Login error:", err);
                return res.redirect("http://localhost:3000/login?error=login_failed");
            }
            
            // Successful authentication, redirect home
            return res.redirect("http://localhost:3000");
        });
    })(req, res, next);
};

module.exports = {
    getUsers,
    getMe,
    registerUser,
    loginUser,
    logoutUser,
    googleAuth,
    googleCallback,
};
