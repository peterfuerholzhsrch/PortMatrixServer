"use strict";
/**
 * The users store (= persistence layer).
 *
 * This code here originates in some parts from https://github.com/gfeller/Vorlesung_Express
 */

const crypto = require('crypto');
const cryptoUtil = require('../util/cryptoUtil');
var Promise = require('promise');
const winston = require('winston');

var LOG_LABEL = 'users-store';
winston.loggers.add(LOG_LABEL, {
    console: {
        label: LOG_LABEL
    }
});
var log = winston.loggers.get(LOG_LABEL);

var Datastore = require('nedb-promise');
var db = new Datastore({ filename: './data/users.db', autoload: true });

// set index on 'email' to make it unique
db.ensureIndex({ fieldName: "email", unique: true, sparse: false }, function(error) { if (error) { throw error; } });


/**
 * Class User
 */
function User(email, password) {
    this.email = email;
    this.passwortHash = cryptoUtil.hashPwd(password);
}


//
// Functions of UsersStore
//

function publicRegisterUserPr(email, password)
{
    if (!(email && password)) {
        throw new Error("Email or password invalid");
    }
    var user = new User(email, password);

    return db.insert(user)
        .then(function (newDoc) {
            if (newDoc) {
                log.info('User inserted: ', newDoc);
            }
            return Promise.resolve(newDoc);
        });
}


function publicAuthenticatePr(email, password) {
    if (!(email && password)) {
        return Promise.reject("Email or password invalid");
    }

    return db.findOne({ email: email })
        .then(function (doc) {
                if (doc == null) {
                    throw new Error("Email or password invalid");
                }
                const passwordValid = doc && doc.passwortHash == cryptoUtil.hashPwd(password);
                if (passwordValid) {
                    return Promise.resolve(doc);
                }
                throw new Error("Email or password invalid");
            });
}


function publicGetUserPr(userId) {
    if (!userId) {
        Promise.reject("userId invalid");
    }
    return db.findOne({ _id: userId })
        .then(function (doc) {
            return Promise.resolve(doc);
        });
}


function publicDeleteUserPr(userId) {
    if (!userId) {
        Promise.reject("userId invalid");
    }

    db.remove({ _id: userId })
        .then(function (numRemoved) {
                if (numRemoved <= 0) {
                    throw new Error("no user found with set userId");
                }
                Promise.resolve(userId);
            });
}




module.exports = {
    registerUserPr : publicRegisterUserPr,
    authenticatePr: publicAuthenticatePr,
    getUserPr: publicGetUserPr,
    deleteUserPr: publicDeleteUserPr
};