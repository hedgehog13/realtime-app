const express = require('express');
const router = express.Router();
const {getToken} = require('../auth/controller');
const {getGames} = require('../games/controller');


router.get('/', getToken, getGames);
module.exports = router;
