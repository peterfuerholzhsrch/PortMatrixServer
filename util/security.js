'use strict';

/**
 * User authentication module.
 * This code here originates (in big parts) from https://github.com/gfeller/Vorlesung_Express
 */

var jwt = require('jsonwebtoken');
var usersStore = require('../services/usersStore.js');


/**
 * @param req
 * @returns {boolean} true if user is logged in
 */
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
 * @param userId Put into JWT token. Can be read from request by <code>req.user.userId</code>. (Placing the JWT content
 * into the request is a feature of express-jwt.)
 * @param userEmail Put into the JWT token. Can be read from by <code>req.user.userEmail</code>. (Placing the JWT content
 * into the request is a feature of express-jwt.)
 * @param secret
 * @param options
 * @returns {*} JSON web token
 */
function privateCreateSessionToken(userId, userEmail, secret, options) {
    return jwt.sign({ userId, userEmail }, secret, options);
}


/**
 * Handles the login request.
 * @param req
 * @param res
 * @param next
 */
function publicHandleLogin(req, res, next) {
    if (publicIsLoggedIn(req)) {
        res.send(true);
    }
    else {
        usersStore.authenticatePr(req.body.email, req.body.password)
            .then(function (user) {
                if (user) {
                    var jsonWebTokenObject = publicCreateWebTokenObject(req.app, user);
                    jsonWebTokenObject = Object.assign(jsonWebTokenObject, { user: user });
                    res.jsonp(jsonWebTokenObject);
                    res.end();
                }
                else {
                    res.status('401').end()
                }
            },
            function (err) {
                res.status('401').end();
            });
    }
}


/**
 * @param app node application (can be accessed by 'request.app')
 * @param user
 * @returns {{token: *}} The JWT token
 */
function publicCreateWebTokenObject(app, user) {
    var jsonWebToken = privateCreateSessionToken(user._id, user.email, app.get('jwt-secret'), app.get('jwt-sign'));
    return { token: jsonWebToken };
}



module.exports = {
    isLoggedIn: publicIsLoggedIn,
    handleAuthenticate: publicAuthenticated,
    current: publicCurrentUser,
    handleLogin: publicHandleLogin,
    createWebTokenObject : publicCreateWebTokenObject
};