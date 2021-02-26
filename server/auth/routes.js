const express = require('express');
const router = express.Router();
const {getToken} = require('./controller');
const {getGames} = require('../games/controller')
const config = require('../config/config');

router.post('/', getToken, (req, res)=>res.redirect('/games'));


module.exports = router;
