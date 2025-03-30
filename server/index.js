const express = require("express");
const passport = require("passport");
require('dotenv').config();
const cors = require("cors");
const passport_google = require("./config/passport-google-oauth.js");
const app = express();
const port = process.env.PORT || 3001;
const bcrypt = require('bcrypt');

const seedAdmin = require('./seeds/adminSeed');

app.use(
    cors({
        origin: ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002'],
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
        allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Origin', 'X-Requested-With'],
        exposedHeaders: ['set-cookie']
    })
);

app.use(express.urlencoded({ extended: true }));  // Changed to true to handle nested objects
app.use(express.json());

app.use(
    require("express-session")({
        secret: "medcare-app-key",
        resave: false,
        saveUninitialized: false,
        cookie: {
            httpOnly: true,
            secure: false,
            maxAge: 24 * 60 * 60 * 1000, // 24 hours
            sameSite: 'lax',
            path: '/',
            domain: 'localhost'
        },
    })
);

app.use(passport.initialize());
app.use(passport.session());


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
const adminDoctorRoutes = require('./routes/admin/doctorRoutes');
const adminAppointmentRoutes = require('./routes/admin/appointmentRoutes');

app.use("/api", indexRouter);
app.use('/api/users', userRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/admin/doctors', adminDoctorRoutes);
app.use('/api/admin/appointments', adminAppointmentRoutes);

seedAdmin().then(() => {
    console.log('Admin seeding completed');
}).catch(error => {
    console.error('Error during admin seeding:', error);
});

app.listen(port, (err) => {
    if (err) console.log("Error:", err);
    console.log("Server is running on port:", port);
});