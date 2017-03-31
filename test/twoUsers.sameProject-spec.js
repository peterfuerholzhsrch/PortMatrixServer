'use strict';
/**
 * This test creates two users on the same project, deletes the users and the project afterwards:
 * - user 1 with project 1 created
 * - user 2 created and added to project 1
 * - user 2 deleted
 * - user 1 deleted which deletes project 1 as well
 *
 * Created by pfu on 06/01/17.
 */

var test = require('./testSettings');
var async = require('async');
var ops = require('./operations');


async.series([
    ops.createUser1,
    ops.createUser2,
    ops.deleteUser2,
    function(cb) {
        console.log('Check that User 1 is still the admin of the project');
        console.log('ops.getJwtToken1=', ops.getJwtToken1());
        console.log('(ops.getJwtToken2=', ops.getJwtToken2(), ')');
        console.log('ops.getUserId1=', ops.getUserId1());
        var f = test.frisby.create('Get project of user1')
            .addHeader('authorization', 'Bearer ' + ops.getJwtToken1())
            .get(test.PROJECTS_REST_URL + '?' + 'userId=' + ops.getUserId1())
            .expectStatus(200)
            .inspectBody()
            .expectBodyContains('"adminId":"' + ops.getUserId1() + '"')
            .expectBodyContains('"users":[]');
        test.callbackAndToss(f, cb);
    },
    ops.deleteUser1
]);



