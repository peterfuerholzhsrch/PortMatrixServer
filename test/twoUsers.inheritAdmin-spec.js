'use strict';
/**
 * This test creates two users on the same project, then deletes the admin afterwards the rest:
 * - user 1 with project 1 created
 * - user 2 created and added to project 1
 * - user 1 deleted, user 2 becomes admin
 * - user 2 deleted which deletes project 1 as well
 *
 * Created by pfu on 06/01/17.
 */

var test = require('./testSettings');
var async = require('async');
var ops = require('./operations');


async.series([
    ops.createUser1,
    function(cb) {
        console.log('Get project(s) of User 1');
        test.frisby.create('Get project(s) of user1')
            .addHeader('authorization', 'Bearer ' + ops.getJwtToken1())
            .get(test.PROJECTS_REST_URL + '?' + 'userId=' + ops.getUserId1())
            .expectStatus(200)
            .inspectBody()
            .afterJSON(function(json) {
                console.log('projects of user1=' + ops.getUserId1() + ': ' + JSON.stringify(json));
                expect(json.data[0]._id).toEqual(ops.getProjectId1());
                cb(null);
            })
            .toss();
    },
    ops.createUser2,
    function(cb) {
        console.log('Check that User 1\'s and User 2\'s project are the same');
        var f = test.frisby.create('Get project of user2')
            .addHeader('authorization', 'Bearer ' + ops.getJwtToken2())
            .get(test.PROJECTS_REST_URL + '?' + 'userId=' + ops.getUserId2() + '&' + 'assignedToo=true')
            .expectStatus(200)
            .inspectBody()
            .expectJSONLength('data', 1) // = length of the array
            .expectBodyContains(ops.getProjectId1());
        test.callbackAndToss(f, cb);
    },
    ops.deleteUser1,
    function(cb) {
        console.log('Check that User 2 is now the admin of the project');
        var f = test.frisby.create('Get project of user2')
            .addHeader('authorization', 'Bearer ' + ops.getJwtToken2())
            .get(test.PROJECTS_REST_URL + '?' + 'userId=' + ops.getUserId2())
            .expectStatus(200)
            .inspectBody()
            .expectJSONLength('data', 1) // = length of the array
            .expectBodyContains('"adminId":"' + ops.getUserId2() + '"');
        test.callbackAndToss(f, cb);
    },
    ops.deleteUser2
]);



