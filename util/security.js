"use strict";

/**
 *
 * This code here originates (in big parts) from https://github.com/gfeller/Vorlesung_Express
 */

var jwt = require('jsonwebtoken');
var usersStore = require('../services/usersStore.js');



function publicIsLoggedIn(req) {
    return req.user != null;
}


function publicAuthenticated(req, res, next) {

    if (publicIsLoggedIn(req)) {
        next();
    }
    else {
        res.status(401).send(false);
    }
}


function publicCurrentUser(req) {
    return req.user.name;
}


/**
 *
 * @param name
 * @param secret
 * @param options
 * @returns {*} JSON web token
 */
function privateCreateSessionToken(name, secret, options) {
    if (!name) {
        return "";
    }
    return jwt.sign({name}, secret, options);
}


function publicHandleLogin(req, res, next) {
    if (publicIsLoggedIn(req)) {
        res.send(true);
    }
    else {
        usersStore.authenticatePr(req.body.email, req.body.password)
            .then(function (user) {
                if (user) {
                    res.jsonp(publicCreateWebTokenObject(req.app, req.body.email, user));
                    res.end();
                }
                else {
                    res.status("401").end()
                }
            },
            function (err) {
                res.status("401").end();
            });
    }
}


/**
 *
 * @param app node application (can be accessed by 'request.app'
 * @param email
 * @param user
 * @returns {{token: *, user: *}}
 */
function publicCreateWebTokenObject(app, email, user) {
    var jsonWebToken = privateCreateSessionToken(email, app.get("jwt-secret"), app.get("jwt-sign"));
    return { token: jsonWebToken, user: user };
}



module.exports = {
    isLoggedIn: publicIsLoggedIn,
    handleAuthenticate: publicAuthenticated,
    current: publicCurrentUser,
    handleLogin: publicHandleLogin,
    createWebTokenObject : publicCreateWebTokenObject
};