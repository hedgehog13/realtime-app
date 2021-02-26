const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const cookieSession  = require("cookie-session");
const axios = require('axios');
const passport = require("passport");
const OAuth2Strategy = require('passport-oauth').OAuth2Strategy;
const config = require('./config/config');
const session = require('express-session');
const request = require('request');
const app = express();

app.set("views", "./views");
app.set("view engine", "ejs");

// Middlewares
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());
app.use(cookieSession({secret:"somesecrettokenhere"}));

app.use(session({
    secret: 'hithere',
    resave: false,
    saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session());


// Override passport profile function to get user profile from Twitch API
OAuth2Strategy.prototype.userProfile = function (accessToken, done) {
    var options = {
        url: 'https://api.twitch.tv/helix/users',
        method: 'GET',
        headers: {
            'Client-ID': config.client_id,
            'Accept': 'application/vnd.twitchtv.v5+json',
            'Authorization': 'Bearer ' + accessToken
        }
    };

    request(options, function (error, response, body) {
        if (response && response.statusCode == 200) {
            done(null, JSON.parse(body));
        } else {
            done(JSON.parse(body));
        }
    });
}

passport.serializeUser(function (user, done) {
    done(null, user);
});

passport.deserializeUser(function (user, done) {
    done(null, user);
});

passport.use('twitch', new OAuth2Strategy({
        authorizationURL: 'https://id.twitch.tv/oauth2/authorize',
        tokenURL: 'https://id.twitch.tv/oauth2/token',
        clientID: config.client_id,
        clientSecret: config.secret,
        callbackURL: config.callback_url,
        state: true
    },
    function (accessToken, refreshToken, profile, done) {
        profile.accessToken = accessToken;
        profile.refreshToken = refreshToken;
        console.log('access token:', accessToken)

        // Securely store user profile in your DB
        //User.findOrCreate(..., function(err, user) {
        //  done(err, user);
        //});

        return done(null, profile);
    }
));

app.get('/',  (req, res)=> {
    console.log(req.headers);
    console.log('*************************')
    console.log(req.session.passport.user)
});

app.get('/auth/twitch', passport.authenticate("twitch"));
app.get('/auth/twitch/callback', passport.authenticate('twitch', {successRedirect: '/', failureRedirect: '/'}));
const http = app.listen(8000,
    () => {

        console.log(`started on port 8000`);

         axios.get('http://localhost:8000/auth/twitch')
            .catch(error => console.log('auth error', error));


    });
