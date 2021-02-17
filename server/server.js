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


app.use(cors());
app.use(session({
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {"httpOnly": false, secure: false, maxAge: 36000000}
}));
app.use(express.static('../client/dist/client/'));

app.all("/*", (req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');
    next();
});

const http = app.listen(8000,
    () => {
        console.log('started on port 8000');
        axios.post('http://localhost:8000/auth/twitch').catch(error => console.log('auth error'));
    });

const io = require('socket.io')(http, {
    cors: {
        origin: "http://localhost:4200",
        methods: ["GET", "POST"]
    }
});
app.post(CALLBACK_URL, (req, res) => {
    console.log(1)
})
app.post('/auth/twitch',
    () => {
        const url_post = `https://id.twitch.tv/oauth2/token?client_id=${TWITCH_CLIENT_ID}&client_secret=${TWITCH_SECRET}&grant_type=client_credentials`;
        axios.post(url_post)
            .then(async result => {
                const token = result.data.access_token;
                const games_array = await getGames(token);
                const counter_game = games_array.find(a => a.name === 'Tom Clancy\'s Rainbow Six Siege');

                getCounter(token, counter_game).catch(err => {
                    console.log('getCounter', err);
                });

                getCounterForChart(games_array, token)
                    .catch(error => console.log('getCounterForChart', error));
            });

    }
);

async function getGames(accessToken) {
    const options = {
        method: 'GET',
        headers: {
            'Client-ID': TWITCH_CLIENT_ID,
            'Authorization': 'Bearer ' + accessToken
        }
    };
    // let games_array;
    const url = encodeURI('https://api.twitch.tv/helix/games?name=Rainbow Six Siege&name=Far Cry 5&name=Assassin\'s Creed: Odyssey');
    return (await axios.get(url, options)).data.data;
}

async function getCounter(token, game_data) {

    let result = await getGameData('', token, 0, game_data);
    if (result && token) getCounter(token, game_data).catch(err => console.log(err));

    io.sockets.emit('getCounter', result);
}

async function getCounterForChart(array_games, accessToken) {
    let result;
    let resultArray = [];
    for (let i = 0; i < array_games.length; i++) {

        result = await getGameData('', accessToken, 0, array_games[i]);
        result.date = new Date();
        resultArray.push(result)
    }
    const date = new Date().getTime();
   const  resData= resultArray.map(a => {

        return {
            date: date,
            name: a.game_data.name,
            id: a.game_data.id,
            counter: a.counter
        }
    });

    io.sockets.emit('getChartData_new', resData);
    if (result && accessToken) {
        getCounterForChart(array_games, accessToken).catch(err => console.log(err));

    }
}

async function getGameData(newCursor, accessToken, counter, game_data) {

    const options = {
        method: 'GET',
        headers: {
            'Client-ID': TWITCH_CLIENT_ID,
            'Authorization': 'Bearer ' + accessToken
        }
    };

    const url = `https://api.twitch.tv/helix/streams?first=100&game_id=${game_data.id}&after=${newCursor}`;
    try {

        const response = await axios.get(url, options).catch(err => console.log('getGameData ERROR', err));
        counter += response.data.data.reduce((prev, cur) => prev + cur.viewer_count, 0);
        const remaining = response.headers['ratelimit-remaining'];
        if (remaining < 3) {
            return;
        }
        if (response && remaining > 0 && response.data.pagination.cursor) {
            return getGameData(response.data.pagination.cursor, accessToken, counter, game_data);
        }
        return {counter: counter, game_data: game_data};

    } catch (error) {
        console.error(error);
    }

}


io.on('connection', (socket) => {

    console.log("User Connected");
    // axios.post('http://localhost:8000/auth/twitch').catch(error => console.log('auth error', error));
    socket.on('disconnect', (msg) => {
        console.log("User DisConnected");
    });

});
