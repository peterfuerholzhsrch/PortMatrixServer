'use strict';

const crypto = require('crypto');
var config = require('../config');

function hashPwd(pwd){
    return crypto.createHmac('sha256', config.hmacSecret) //more information: https://nodejs.org/api/crypto.html
        .update(pwd)
        .digest('hex');
}

module.exports = {hashPwd};