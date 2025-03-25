const bcrypt = require("bcrypt");
const passport_local = require("../config/passport-local-strategy.js");
const db = require("../config/db.js");
const passport_google = require("../config/passport-google-oauth.js");

const getUsers = (req, res) => {
    res.status(200).json({
        ok: true,
        data: "Users data received",
    });
};

const getMe = (req, res) => {
    if (req.isAuthenticated()) {
        res.json(req.user);
    } else {
        res.status(401).json({ message: "Not authenticated" });
    }
};

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

const loginUser = (req, res, next) => {
    passport_local.authenticate("local", (err, user, info) => {
        if (err) {
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

const googleauth = (req, res) => {
    passport_google.authenticate("google", { 
        scope: ["profile", "email"],
        prompt: "select_account"
    })(req, res);
};

const googleCallback = (req, res, next) => {
    passport_google.authenticate("google", (err, user) => {
        if (err) {
            return res.status(500).json({
                message: "Google authentication failed",
                ok: false
            });
        }
        if (!user) {
            return res.status(401).json({
                message: "Google authentication failed",
                ok: false
            });
        }
        req.logIn(user, (err) => {
            if (err) {
                return res.status(500).json({
                    message: "Login failed",
                    ok: false
                });
            }
            return res.status(200).json({
                user,
                ok: true
            });
        });
    })(req, res, next);
};

module.exports = {
    getUsers,
    getMe,
    registerUser,
    loginUser,
    logoutUser,
    googleauth,
    googleCallback,
};
