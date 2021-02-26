const express = require('express');
const router = express.Router();
const {getToken} = require('./controller');

router.post('/', getToken, (req, res)=>res.redirect('/games'));


module.exports = router;
