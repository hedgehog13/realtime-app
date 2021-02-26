const axios = require('axios');
const config = require('../config/config');

const token_utl = `${config.token_url}?client_id=${config.client_id}&client_secret=${config.secret}&grant_type=client_credentials`;
exports.getToken = async (req, res, next) => {

    const accessToken = await axios.post(token_utl).catch(e => console.log('get token', e));
    req.token = accessToken.data;
    return next();
}

