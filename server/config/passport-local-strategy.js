const passport = require("passport");

const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcrypt");

const db = require("../config/db.js");

passport.use(
    new LocalStrategy(
        {
            usernameField: "email",
        },
        async function (email, password, done) {
        
            try {
              
                const user = await db.oneOrNone(
                    "SELECT * FROM users WHERE user_emailid = $1",
                    [email]
                );

                if (!user) {
                    return done(null, false, { message: "Incorrect email." });
                }

               
                const isMatch = await bcrypt.compare(password, user.password);
                if (!isMatch) {
                    return done(null, false, {
                        message: "Incorrect password.",
                    });
                }

                return done(null, user);
            } catch (err) {
                return done(err);
            }
        }
    )
);

passport.serializeUser((user, done) => {
    done(null, user.user_id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const user = await db.oneOrNone(
            "SELECT * FROM users WHERE user_id = $1",
            [id]
        );
        done(null, user);
    } catch (err) {
        done(err);
    }
});

passport.checkAuthentication = function (req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    return res.redirect("/login");
};

module.exports = passport;