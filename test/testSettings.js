'use strict';
/**
 * Created by pfu on 25/01/17.
 */

var publicFrisby = require('frisby');

var PUBLIC_BASE_URL = 'http://localhost:3001';

// found on https://github.com/vlucas/frisby/issues/80
publicFrisby.globalSetup({
    timeout: 60000 // 1 minute
});

/**
 * Helper method.
 * @param frisby
 * @param cb
 */
function publicCallbackAndToss(frisby, cb) {
    frisby.after(function() {
        cb(null);
    }).toss();
}

module.exports = {
    BASE_URL: PUBLIC_BASE_URL,
    LOGIN_REST_URL: PUBLIC_BASE_URL + '/api/login',
    USERS_REST_URL: PUBLIC_BASE_URL + '/api/users',
    PROJECTS_REST_URL: PUBLIC_BASE_URL + '/api/projects',
    NWSWS_REST_URL: PUBLIC_BASE_URL + '/api/nwsws',
    frisby : publicFrisby,
    callbackAndToss: publicCallbackAndToss
};
