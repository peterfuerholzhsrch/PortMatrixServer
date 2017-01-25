"use strict";
/**
 * This test creates two users on project and deletes the users and the project afterwards.
 *
 * Created by pfu on 06/01/17.
 */

var test = require('./testSettings');
var async = require('async');

var userId1, userId2;
var jwtToken1, jwtToken2;
var projectId1;


async.series([
    function(cb) {
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
                userId1 = json.user._id;
                jwtToken1 = json.token;
                cb(null);
            })
            .toss();
    },
    function(cb) {
        console.log('Get project(s) of User 1');
        //userid1 = json._id;
        test.frisby.create('Get project(s) of user1')
            .addHeader('authorization', 'Bearer ' + jwtToken1)
            .get(test.PROJECTS_REST_URL + '?' + 'userId=' + userId1)
            .expectStatus(200)
            .inspectBody()
            .afterJSON(function(json) {
                console.log("projects of user1=" + userId1 + ": " + JSON.stringify(json));
                projectId1 = json.data[0]._id;
                cb(null);
            })
            .toss();
    },
    function(cb) {
        console.log('Create User 2 and add to existing project');
        console.log("project's id=" + projectId1);
        test.frisby.create('Create user and add existing project')
            .post(test.USERS_REST_URL, {
                email: "peter.fuerholz@vtxmail.ch",
                password: "4321",
                referencedProject: projectId1
            })
            .expectStatus(200)
            .inspectBody()
            .expectBodyContains('project')
            .expectBodyContains('token')
            .afterJSON(function(json) {
                userId2 = json.user._id;
                jwtToken2 = json.token;
                cb(null);
            })
            .toss();
    },
    function(cb) {
        console.log("Check that User 1's and User 2's project are the same");
        var f = test.frisby.create('Get project of user2')
            .addHeader('authorization', 'Bearer ' + jwtToken2)
            .get(test.PROJECTS_REST_URL + '?' + 'userId=' + userId2 + '&' + 'assignedToo=true')
            .expectStatus(200)
            .inspectBody()
            .expectJSONLength('data', 1) // = length of the array
            .expectBodyContains(projectId1);
        test.callbackAndToss(f, cb);
    },
    function(cb) {
        console.log('Delete User 1');
        var f = test.frisby.create('Delete User1')
            .addHeader('authorization', 'Bearer ' + jwtToken1)
            .delete(test.USERS_REST_URL + "/" + userId1)
            .expectStatus(200)
            .inspectBody();
        test.callbackAndToss(f, cb);
    },
    function(cb) {
        console.log("Check that User 2 does not have any project");
        var f = test.frisby.create('Get project of user2')
            .addHeader('authorization', 'Bearer ' + jwtToken2)
            .get(test.PROJECTS_REST_URL + '?' + 'userId=' + userId2 + '&' + 'assignedToo=true')
            .expectStatus(200)
            .inspectBody()
            .expectJSONLength('data', 0); // = length of the array
        test.callbackAndToss(f, cb);
    },
    function(cb) {
        console.log('Delete User 2');
        var f = test.frisby.create('Delete User2')
            .addHeader('authorization', 'Bearer ' + jwtToken2)
            .delete(test.USERS_REST_URL + "/" + userId2)
            .expectStatus(200)
            .inspectBody();
        test.callbackAndToss(f, cb);
    }
]);



