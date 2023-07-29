const express = require('express');
require('dotenv').config()
const passport = require('passport');
const path = require("path");
const cookieParser = require("cookie-parser");
const YandexStrategy = require('passport-yandex').Strategy;


function isAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect('/');
}

passport.serializeUser((user, done) => {
    done(null, user);
});

passport.deserializeUser((obj, done) => {
    done(null, obj);
});

passport.use(new YandexStrategy({
        clientID: process.env.YANDEX_CLIENT_ID,
        clientSecret: process.env.YANDEX_CLIENT_SECRET,
        callbackURL: process.env.CALLBACK_URL
    },
    (accessToken, refreshToken, profile, done) => {
        process.nextTick(() => {
            return done(null, profile);
        });
    }
));

const app = express();
const PORT = process.env.PORT || 4000

app.use(express.json())
app.use(express.urlencoded());

app.use(require('cookie-parser')());
app.use(require('express-session')({
    secret: process.env.COOKIE_SECRET || "COOKIE_SECRET",
}));

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(passport.initialize());
app.use(passport.session());

app.get('/', (req, res) => {
    res.render('layout', {user: req.user});
});

app.get('/profile', isAuthenticated, function(req, res){
    res.render('account', { user: req.user });
});

app.get('/login', function(req, res){
    res.render('login', { user: req.user });
});

app.get('/auth/yandex',
    passport.authenticate('yandex'),
    function(req, res){});

app.get('/auth/yandex/callback',
    passport.authenticate('yandex', { failureRedirect: '/login' }),
    function(req, res) {
        res.redirect('/');
    });

app.get('/logout', function(req, res){
    res.clearCookie('connect.sid')
    res.redirect('/');
});

const startApp = async () => {
    try {
        app.listen(PORT, () => console.log(`Server started on port ${PORT}`))
    } catch (e) {
        console.log(e)
    }
}

startApp()
