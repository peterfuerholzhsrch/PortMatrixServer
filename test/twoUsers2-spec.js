"use strict";
/**
 * This test creates two users on project and deletes the users and the project afterwards.
 *
 * Created by pfu on 06/01/17.
 */

var test = require('./testSettings');
var async = require('async');
var ops = require('./operations');



// create user 1 and 2, check that they belong to same project then delete first user 1, then 2:
async.series([
    ops.createUser1,
    ops.createUser2,
    ops.deleteUser2,
    function(cb) {
        console.log("Check that User 1 is still the admin of the project");
        console.log("ops.jwtToken1=", ops.jwtToken1());
        console.log("(ops.jwtToken2=", ops.jwtToken2(), ")");
        console.log("ops.userId1=", ops.userId1());
        var f = test.frisby.create('Get project of user1')
            .addHeader('authorization', 'Bearer ' + ops.jwtToken1())
            .get(test.PROJECTS_REST_URL + '?' + 'userId=' + ops.userId1())
            .expectStatus(200)
            .inspectBody()
            .expectBodyContains('"adminId":"' + ops.userId1() + '"')
            .expectBodyContains('"users":[]');
        test.callbackAndToss(f, cb);
    },
    ops.deleteUser1
]);



