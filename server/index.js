const express = require("express");
const passport = require("passport");
require('dotenv').config();

const passport_local = require("./config/passport-local-strategy.js");
const cors = require("cors");
const passport_google = require("./config/passport-google-oauth.js");
const app = express();
const port = process.env.PORT || 3001;

app.use(
    cors({
        origin: ["http://localhost:3000", "http://localhost:3001"],
        credentials: true,
        methods: ["GET", "POST", "PUT", "DELETE"],
        allowedHeaders: ["Content-Type", "Authorization", "Accept"],
    })
);

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.use(
    require("express-session")({
        secret: "medcare-app-key",
        resave: false,
        saveUninitialized: false,
        cookie: {
            httpOnly: true,
            secure: false, // set to true in production with HTTPS
            maxAge: 24 * 60 * 60 * 1000, // 24 hours
            sameSite: 'lax',
            path: '/',
            domain: 'localhost'
        },
    })
);

app.use(passport.initialize());
app.use(passport.session());

// Debug middleware to log session and auth status
app.use((req, res, next) => {
    console.log('Session:', req.session);
    console.log('User:', req.user);
    console.log('Authenticated:', req.isAuthenticated());
    next();
});

app.get("/", (req, res) => {
    res.send("Hello world");
});

const indexRouter = require("./routes/index");
const userRoutes = require('./routes/usersRouter');
const appointmentRoutes = require('./routes/appointmentRoutes');

app.use("/api", indexRouter);
app.use('/api/users', userRoutes);
app.use('/api/appointments', appointmentRoutes);

app.listen(port, (err) => {
    if (err) console.log("Error:", err);
    console.log("Server is running on port:", port);
});