"use strict";
/**
 * This test tests the following:
 * - log in with correct / wrong credentials
 * - check with correct / wrong authentication token
 *
 * Created by pfu on 25/01/17.
 */

var test = require('./testSettings');
var async = require('async');

var userId;
var jwtToken;

const EMAIL = "peter@peter-fuerholz.ch";


async.series([
    function(cb) {
        console.log('Preparation: Create User');
        test.frisby.create('Preparation: Create a User')
            .post(test.USERS_REST_URL, {
                email: EMAIL,
                password: "1234"
            })
            .expectStatus(200)
            .afterJSON(function () {
                userId = json.user._id;
                jwtToken = json.token;
                cb(null);
            })
            .toss();
    },
    // There is no real logout -> just ignore jwtToken
    function(cb) {
        console.log('Login with wrong credentials');
        var f = test.frisby.create('Login with wrong credentials')
            .post(test.LOGIN_REST_URL, {
                email: EMAIL,
                password: "4321"
            })
            .expectStatus(401)
            .inspectBody();
        test.callbackAndToss(f, cb);
    },
    function(cb) {
        console.log('Login with correct credentials');
        test.frisby.create('Login with correct credentials')
            .post(test.LOGIN_REST_URL, {
                email: EMAIL,
                password: "1234"
            })
            .expectStatus(200)
            .inspectBody()
            .afterJSON(function () {
                userId = json.user._id;
                jwtToken = json.token;
                cb(null);
            })
            .toss();
    },
    function(cb) {
        console.log('Get project(s) of user with wrong JWT token');
        var f = test.frisby.create('Get project(s) of user with wrong JWT token')
            .addHeader('authorization', 'Bearer ' + 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYW1lIjoicGV0ZXIuZnVlcmhvbHpAdnR4bWFpbC5jaCIsImlhdCI6MTQ4NTM0Nzg1MiwiZXhwIjoxNDg1NDM0MjUyLCJhdWQiOiJzZWxmIiwiaXNzIjoiTWFyY28gRW5kcmVzIC8gUGV0ZXIgRnVlcmhvbHoifQ.K24_gttlNEgaGaJHE-V338mBqShoqaGfU2Dq1CiNJBX')
            .get(test.PROJECTS_REST_URL + '?' + 'userId=' + userId)
            .expectStatus(500)
            .inspectBody();
        test.callbackAndToss(f, cb);
    },
    function(cb) {
        console.log('Get project(s) of user with correct JWT token');
        var f = test.frisby.create('Get project(s) of user with correct JWT token')
            .addHeader('authorization', 'Bearer ' + jwtToken)
            .get(test.PROJECTS_REST_URL + '?' + 'userId=' + userId)
            .expectStatus(200)
            .inspectBody();
        test.callbackAndToss(f, cb);
    },
    function(cb) {
        console.log('Delete User');
        var f = test.frisby.create('Delete User')
            .addHeader('authorization', 'Bearer ' + jwtToken)
            .delete(test.USERS_REST_URL + "/" + userId)
            .expectStatus(200)
            .inspectBody();
        test.callbackAndToss(f, cb);
    }
]);
