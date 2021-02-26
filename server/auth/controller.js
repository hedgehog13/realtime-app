const axios = require('axios');
const config = require('../config/config');


exports.getToken = async (req, res, next) => {

    const url_post = `https://id.twitch.tv/oauth2/token?client_id=${config.client_id}&client_secret=${config.secret}&grant_type=client_credentials`;
    let accessToken = req.header('Authorization');
    if (!accessToken) {
        accessToken = await axios.post(url_post).catch(e => console.log('get token', e));
    }
    req.token = accessToken.data;

    return next();

}

