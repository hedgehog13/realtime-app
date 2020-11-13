const express = require('express');
const session = require('express-session');
const passport = require('passport');
const OAuth2Strategy = require('passport-oauth').OAuth2Strategy;
const request = require('request');
const handlebars = require('handlebars');


// Define our constants, you will change these with your own
const TWITCH_CLIENT_ID = 'bnovmkukib4m30y39t9w03tnu34jxe';
const TWITCH_SECRET = '2w698wvvbqfdrpd8l31oz8jo9xrtns';
const SESSION_SECRET = 'some_secret>';
const CALLBACK_URL = 'http://localhost:8000/auth/twitch/callback';  // You can run locally with
// - http://localhost:3000/auth/twitch/callback

// Initialize Express and middlewares
const app = express();
app.use(session({secret: SESSION_SECRET, resave: false, saveUninitialized: false}));
app.use(express.static('../client/dist/client'));
//app.use(express.static('public'));
app.use(passport.initialize());
app.use(passport.session());

app.all("/*", (req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');
    next();
});


app.listen(8000, function () {
    console.log('Twitch auth sample listening on port 8000!')
});


// Override passport profile function to get user profile from Twitch API
OAuth2Strategy.prototype.userProfile = function (accessToken, done) {
    const options = {
        url: 'https://api.twitch.tv/helix/users',
        method: 'GET',
        headers: {
            'Client-ID': TWITCH_CLIENT_ID,
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
};

passport.serializeUser(function (user, done) {
    done(null, user);
});

passport.deserializeUser(function (user, done) {
    done(null, user);
});

passport.use('twitch', new OAuth2Strategy({
        authorizationURL: 'https://id.twitch.tv/oauth2/authorize',
        tokenURL: 'https://id.twitch.tv/oauth2/token',
        clientID: TWITCH_CLIENT_ID,
        clientSecret: TWITCH_SECRET,
        callbackURL: CALLBACK_URL,
        state: true
    },
    function (accessToken, refreshToken, profile, done) {
        profile.accessToken = accessToken;
        profile.refreshToken = refreshToken;

        // Securely store user profile in your DB
        //User.findOrCreate(..., function(err, user) {
        //  done(err, user);
        //});

        done(null, profile);
    }
));

// Set route to start OAuth link, this is where you define scopes to request
app.get('/auth/twitch', passport.authenticate('twitch', {scope: 'user_read'}));

// Set route for OAuth redirect
app.get('/auth/twitch/callback', passport.authenticate('twitch',
    {successRedirect: '/', failureRedirect: '/'}));
// //
//
app.get('/home', (req, res) => {
    console.log('i\'m here!!')
    if (req.session && req.session.passport && req.session.passport.user) {
        console.log('i\'m in!!');
        res.json( req.session.passport.user);
    } else {
        console.log('else')
        res.json({res: 'start'})
        //  res.send('<html><head><title>Twitch Auth Sample</title></head><a href="/auth/twitch"><img src="http://ttv-api.s3.amazonaws.com/assets/connect_dark.png"></a></html>');
    }
});

