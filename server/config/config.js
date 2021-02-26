const dotenv = require('dotenv');
const env = process.env.NODE_ENV;
dotenv.config();

module.exports = {
    secret: process.env.TWITCH_SECRET,
    client_id: process.env.TWITCH_CLIENT_ID,
    callback_url: process.env.CALLBACK_URL,
    port: parseInt(process.env.PORT) || 8000,
    socket_origin: process.env.SOCKET_ORIGIN,
    token_url:'https://id.twitch.tv/oauth2/token'
};
