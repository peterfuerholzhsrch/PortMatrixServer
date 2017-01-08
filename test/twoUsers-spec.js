"use strict";
/**
 * Created by pfu on 06/01/17.
 */

var BASE_URL = 'http://localhost:3001';
var USERS_REST_URL = BASE_URL + '/api/users';
var PROJECTS_REST_URL = BASE_URL + '/api/projects';

var frisby = require('frisby');

var async = require('async');
var userId1, userId2;
var projectId1;


async.series([
    function(cb) {
        console.log('Create User 1');
        frisby.create('Create a User')
            .post(USERS_REST_URL, {
                email: "peter@peter-fuerholz.ch",
                password: "1234"
            })
            .expectStatus(200)
            .inspectBody()
            .afterJSON(function () {
                userId1 = json._id;
                cb(null);
            })
            .toss();
    },
    function(cb) {
        console.log('Get project(s) of User 1');
        //userid1 = json._id;
        frisby.create('Get project(s) of user1')
            .get(PROJECTS_REST_URL + '?' + 'userId=' + userId1)
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
        frisby.create('Create user and add existing project')
            .post(USERS_REST_URL, {
                email: "peter.fuerholz@vtxmail.ch",
                password: "4321",
                referencedProject: projectId1
            })
            .expectStatus(200)
            .inspectBody()
            .afterJSON(function(json) {
                userId2 = json._id;
                cb(null);
            })
            .toss();
    },
    function(cb) {
        console.log("Check that User 1's and User 2's project are the same");
        var f = frisby.create('Get project of user2')
            .get(PROJECTS_REST_URL + '?' + 'userId=' + userId2 + '&' + 'assignedToo=true')
            .expectStatus(200)
            .inspectBody()
            .expectJSONLength('data', 1) /* = length of the array */
            .expectBodyContains(projectId1);
        callbackAndToss(f, cb);
    },
    function(cb) {
        console.log('Delete User 1');
        var f = frisby.create('Delete User1')
            .delete(USERS_REST_URL, { userId: userId1 })
            .expectStatus(200)
            .inspectBody();
        callbackAndToss(f, cb);
    },
    function(cb) {
        console.log("Check that User 2 does not have any project");
        var f = frisby.create('Get project of user2')
            .get(PROJECTS_REST_URL + '?' + 'userId=' + userId2 + '&' + 'assignedToo=true')
            .expectStatus(200)
            .inspectBody()
            .expectJSONLength('data', 0) /* = length of the array */
        callbackAndToss(f, cb);
    },
    function(cb) {
        console.log('Delete User 2');
        var f = frisby.create('Delete User2')
            .delete(USERS_REST_URL, { userId: userId2 })
            .expectStatus(200)
            .inspectBody();
        callbackAndToss(f, cb);
    }
]);


/**
 * Helper method.
 * @param frisby
 * @param cb
 */
function callbackAndToss(frisby, cb) {
    frisby.after(function() {
        cb(null);
    }).toss();
}
