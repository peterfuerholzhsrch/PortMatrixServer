"use strict";
/**
 * The users store (= persistence layer).
 *
 * This code here originates in big parts from https://github.com/gfeller/Vorlesung_Express
 */

const crypto = require('crypto');
const cryptoUtil = require('../util/cryptoUtil');


var Datastore = require('nedb');
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

function publicRegisterUser(email, password, callback)
{
    if (!(email && password)) {
        callback("Email or password invalid", null);
        return;
    }

    var user = new User(email, password);
    db.insert(user, function(err, newDoc){
        if (callback) {
            callback(err, newDoc);
        }
    });
}

function publicAuthenticate(email, password, callback) {
    if (!(email && password)) {
        callback("Email or password invalid", false);
    }

    db.findOne({ email: email }, function (err, doc) {
        if (doc == null && !err) {
            //publicRegisterUser(email, password, callback);
            callback("Email or password invalid", false);
        }
        else {
            callback(err, /* valid: */ doc && doc.passwortHash == cryptoUtil.hashPwd(password));
        }
    });
}


function publicDeleteUser(userId, callback) {
    if (!userId) {
        callback("userId invalid", false);
    }

    db.remove({ _id: userId }, function (err, doc) {
        if (doc == null && !err) {
            callback("userId invalid", false);
        }
        else {
            callback(err, /* valid: */doc);
        }
    });
}


module.exports = {
    registerUser : publicRegisterUser,
    authenticate : publicAuthenticate,
    deleteUser: publicDeleteUser
};