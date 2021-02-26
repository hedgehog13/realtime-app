const express = require('express');
const app = require('express')();
const axios = require('axios');

const config = require('./config/config');
app.use(express.static('../client/dist/client/'));

app.all("/*", (req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');
    next();
});
app.use(express.json());
//
const http = app.listen(8000,
    () => {
        console.log(`started on port 8000`, 1);
        axios.post('http://localhost:8000/auth/twitch')
            .catch(error => console.log('auth error', error));

    });

const io = require('socket.io')(http, {
    cors: {
        origin: config.socket_origin,
        methods: ["GET", "POST"]
    }
});

require('./socket/socket')(io);
app.use('/auth/twitch', require('./auth/routes'));
app.use((req, res, next)=> {
    req.io = io;
    next();
});
app.use('/games', require('./games/routes'));

module.exports = app;
