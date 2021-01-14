// Define our dependencies
const express = require('express');
const session = require('express-session');
const cors = require('cors');
const axios = require('axios');
const TWITCH_CLIENT_ID = 'bnovmkukib4m30y39t9w03tnu34jxe';
const TWITCH_SECRET = '2w698wvvbqfdrpd8l31oz8jo9xrtns';
const SESSION_SECRET = 'some_secret';
const CALLBACK_URL = 'http://localhost:8000/auth/twitch/callback';


// Initialize Express and middlewares
const app = require('express')();
const http = require('http').createServer(app);
const io = require('socket.io')(http, {
    cors: {
        origin: "http://localhost:4200",
        methods: ["GET", "POST"]
    }
});

app.use(cors());
app.use(session({
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {"httpOnly":false,  secure: false, maxAge: 36000000}}));
app.use(express.static('../client/dist/client/'));


app.all("/*", (req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');
    next();
});
http.listen(8000, function () {
    console.log('Twitch auth sample listening on port 8000!');
});

app.post('/auth/twitch/callback',

    (req, res) => {
        // console.log(req.session.token_data);
        // res.redirect('/home');
        console.log('i am callback');
    }
);
// If user has an authenticated session, display it, otherwise display link to authenticate


app.post('/token',  (req, res) => {


    const code = req.query.code;
    const url_post = `https://id.twitch.tv/oauth2/token?client_id=${TWITCH_CLIENT_ID}&client_secret=${TWITCH_SECRET}&code=${code}&grant_type=authorization_code&redirect_uri=${CALLBACK_URL}`;
    try {

       // const access_token_data = await axios.post(url_post);
        // console.log(access_token_data);
        //
        // if (access_token_data) {
        //     req.session.token = {data: access_token_data};
        //      res.redirect('/test');
        // } else {
        //     // Login error
        // }
        axios.post(url_post)
            .then(result => {
             //   console.log(result.data);

                req.session.token = result.data;
               // pollfiveminuts(result.data.access_token);

                req.session.save(function(err){
                    if(err) {
                        res.end('session save error: ' + err)
                        return
                    }
                    res.redirect('/test')
                })


            }).catch(err => {

            res.json({'ERROR': err});
        });


    } catch (e) {
        console.log('ERROR', e);
        res.json({'ERROR': e});

    }
})
app.get('/test', (req, res) => {
    console.log(req.session);
    // res.json({'result': 'accepted'});
})

async function getGamesIds(accessToken) {
    const options = {
        method: 'GET',
        headers: {
            'Client-ID': TWITCH_CLIENT_ID,
            'Authorization': 'Bearer ' + accessToken
        }
    };
    // let games_array;
    const url = encodeURI('https://api.twitch.tv/helix/games?name=Rainbow Six Siege&name=Far Cry 5&name=Assassin/’s Creed Odyssey');
    return (await axios.get(url, options)).data.data;

    // return games_array.data.data;
}

async function getGameData(newCursor, accessToken, counter) {
    const options = {
        method: 'GET',
        headers: {
            'Client-ID': TWITCH_CLIENT_ID,
            'Authorization': 'Bearer ' + accessToken
        }
    };
    const url = `https://api.twitch.tv/helix/streams?game_id=460630&after=${newCursor}`;
    try {
        const response = await axios.get(url, options).catch(err => console.log(err.data));

        counter += response.data.data.reduce((prev, cur) => prev + cur.viewer_count, 0);
        if (response && response.data.pagination.cursor) {
            return getGameData(response.data.pagination.cursor, accessToken, counter);
        }
        return counter;

    } catch (error) {
        console.error(error);
    }
}

async function pollfiveminuts(token) {


    let result = await getGameData('', token, 0);
    console.log(result);
    if (result && token) {
        pollfiveminuts(token);
        console.log('*************************', result);
        io.sockets.emit('getCounter', result);
    }

}

io.on('connection', (socket) => {
    console.log('open socket');

    socket.on('disconnect', () => {
        console.log('user disconnected');
    });
});


