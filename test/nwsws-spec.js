'use strict';
/**
 * This test creates a user, a project and an network switching, checks adding network switching with wrong project id.
 * Then the user is removed and checked that network switching is removed as well.
 *
 * Created by pfu on 06/01/17.
 */

var test = require('./testSettings');
var async = require('async');

var userId;
var jwtToken;
var projectId;
var nwswId1;

async.series([
    function(cb) {
        console.log('Preparation: Create User');
        test.frisby.create('Preparation: Create a User')
            .post(test.USERS_REST_URL, {
                email: 'peter@peter-fuerholz.ch',
                password: '1234'
            })
            .expectStatus(200)
            .inspectBody()
            .expectBodyContains('project')
            .expectBodyContains('token')
            .afterJSON(function () {
                userId = json.user._id;
                jwtToken = json.token;
                projectId = json.project._id;
                cb(null);
            })
            .toss();
    },
    function(cb) {
        console.log('Create Network Switching');
        test.frisby.create('Create Network Switching')
            .addHeader('authorization', 'Bearer ' + jwtToken)
            .post(test.NWSWS_REST_URL + '/' + projectId, {
                ID: 'AA1',
                remark: 'Bla Bla Bal',
                source: {group: 'SZP', host: 'swawz', ipAddr: '10.100.127.18', zone: 'braun'},
                destination: {group: 'SZD', host: 'bwawa', ipAddr: '20.030.168.17', zone: 'rot', port: '122-133'}
            }, {json: true})
            .expectStatus(200)
            .inspectBody()
            .afterJSON(function(json) {
                console.log('nwsws=' + JSON.stringify(json));
                nwswId1 = json._id;
                cb(null);
            })
            .toss();
    },
    function(cb) {
        console.log('Test to create Network Switching with false projectId');
        test.frisby.create('Test to create Network Switching with false projectId')
            .post(test.NWSWS_REST_URL + '/a' + projectId, {
                ID: 'TEST',
                remark: 'Bla Bla Bal'
            }, {json: true})
            .expectStatus(500)
            .after(function(json) {
                cb(null);
            })
            .toss();
    },
    function(cb) {
        console.log('Update Network Switching 1');
        test.frisby.create('Update Network Switching 1')
            .addHeader('authorization', 'Bearer ' + jwtToken)
            .put(test.NWSWS_REST_URL + '/' + projectId + '/' + nwswId1, {
                ID: 'AAA1',
                remark: 'Bla Bla Bla'
            }, {json: true})
            .expectStatus(200)
            .inspectBody()
            .afterJSON(function(json) {
                console.log('nwsws=' + JSON.stringify(json));
                nwswId1 = json._id;
                cb(null);
            })
            .toss();
    },
    function(cb) {
        console.log('Delete User (incl. project and network switchings)');
        var f = test.frisby.create('Delete User (incl. project and network switchings)')
            .addHeader('authorization', 'Bearer ' + jwtToken)
            .delete(test.USERS_REST_URL + '/' + userId)
            .expectStatus(200)
            .inspectBody();
        test.callbackAndToss(f, cb);
    },
    function(cb) {
        console.log('Check that Network Switching got deleted as well!!');
        var f = test.frisby.create('Check that Network Switching got deleted as well!!')
            .addHeader('authorization', 'Bearer ' + jwtToken)
            .get(test.NWSWS_REST_URL + '/' + 'projectId=' + projectId + '/' + nwswId1)
            .expectStatus(500)
            .inspectBody();
        test.callbackAndToss(f, cb);
    }
]);



