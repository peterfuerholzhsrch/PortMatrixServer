"use strict";

/**
 * Created by pfu on 30/01/17.
 */
var test = require('./testSettings');

var publicUserId1, publicUserId2;
var publicJwtToken1, publicJwtToken2;
var publicProjectId1;



var publicCreateUser1 = function(cb) {
    console.log('Create User 1');
    test.frisby.create('Create a User')
        .post(test.USERS_REST_URL, {
            email: "peter@peter-fuerholz.ch",
            password: "1234"
        })
        .expectStatus(200)
        .inspectBody()
        .expectBodyContains('project')
        .expectBodyContains('token')
        .afterJSON(function () {
            publicUserId1 = json.user._id;
            publicJwtToken1 = json.token;
            publicProjectId1 = json.project._id;
            cb(null);
        })
        .toss();
};

var publicGetProjectOfUser1 = function(cb) {
    console.log('Get project(s) of User 1');
    test.frisby.create('Get project(s) of user1')
        .addHeader('authorization', 'Bearer ' + publicJwtToken1)
        .get(test.PROJECTS_REST_URL + '?' + 'userId=' + publicUserId1)
        .expectStatus(200)
        .inspectBody()
        .afterJSON(function(json) {
            console.log("projects of user1=" + publicUserId1 + ": " + JSON.stringify(json));
            expect(json.data[0]._id).toEqual(publicProjectId1);
            cb(null);
        })
        .toss();
};

var publicCreateUser2 = function(cb) {
    console.log('Create User 2 and add to existing project');
    console.log("project's id=" + publicProjectId1);
    test.frisby.create('Create user and add existing project')
        .post(test.USERS_REST_URL, {
            email: "peter.fuerholz@vtxmail.ch",
            password: "4321",
            referencedProject: publicProjectId1
        })
        .expectStatus(200)
        .inspectBody()
        .expectBodyContains('project')
        .expectBodyContains('token')
        .afterJSON(function(json) {
            publicUserId2 = json.user._id;
            publicJwtToken2 = json.token;
            cb(null);
        })
        .toss();
};

var publicDeleteUser1 = function(cb) {
    console.log('Delete User 1');
    var f = test.frisby.create('Delete User1')
        .addHeader('authorization', 'Bearer ' + publicJwtToken1)
        .delete(test.USERS_REST_URL + "/" + publicUserId1)
        .expectStatus(200)
        .inspectBody();
    test.callbackAndToss(f, cb);
};


var publicDeleteUser2 = function(cb) {
    console.log('Delete User 2');
    var f = test.frisby.create('Delete User2')
        .addHeader('authorization', 'Bearer ' + publicJwtToken2)
        .delete(test.USERS_REST_URL + "/" + publicUserId2)
        .expectStatus(200)
        .inspectBody();
    test.callbackAndToss(f, cb);
};


module.exports = {
    userId1: function () { return publicUserId1 },
    userId2: function () { return publicUserId2 },
    jwtToken1: function () { return publicJwtToken1 },
    jwtToken2: function () { return publicJwtToken2 },
    projectId1: function () { return publicProjectId1 },
    createUser1: publicCreateUser1,
    getProjectOfUser1: publicGetProjectOfUser1,
    createUser2: publicCreateUser2,
    deleteUser1: publicDeleteUser1,
    deleteUser2: publicDeleteUser2
};