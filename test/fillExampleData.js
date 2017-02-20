"use strict";
/**
 * This is not a real test. Execute this 'test' to fill the database with initial data:
 * - user with email 'a@a.a' and password 'a'
 * - one initial project
 * - a set of network switchings
 *
 * Created by pfu on 06/01/17.
 */

var test = require('./testSettings');
var async = require('async');

var USER_EMAIL = "a@a.a";

// TODO check states!

const nwsws = [
    {
        id: '11', state: 'Pending',
        source: {group: 'SZP', host: 'swawz', ipAddr: '10.100.127.18', zone: 'braun'},
        destination: {group: 'SZD', host: 'bwawa', ipAddr: '20.030.168.17', zone: 'rot', port: '122-133'}
    },
    {
        id: '12', state: 'Implemented',
        source: {group: 'SZP', host: 'swbwz', ipAddr: '10.100.128.18', zone: 'rot'},
        destination: {group: 'SZD', host: 'swbwz', ipAddr: '20.030.168.17', zone: 'gelb', port: '16000'}
    },
    {
        id: '13', state: 'Implemented',
        source: {group: 'SZP', host: 'swawz', ipAddr: '10.100.127.18', zone: 'orange'},
        destination: {group: 'SZD', host: 'bwawa', ipAddr: '20.030.168.17', zone: 'rot', port: '8080'}
    },
    {
        id: '14', state: 'Deleted',
        source: {group: 'SZP', host: 'swawz', ipAddr: '10.100.127.18', zone: 'orange'},
        destination: {group: 'SZD', host: 'bwawa', ipAddr: '20.030.168.17', zone: 'gelb', port: '8080, 8088'}
    },
    {
        id: '15', state: 'Pending',
        source: {group: 'SZP', host: 'swawz', ipAddr: '10.100.127.18', zone: 'braun'},
        destination: {group: 'SZD', host: 'bwawa', ipAddr: '20.030.168.17', zone: 'rot', port: '10'}
    },

    {
        id: '16', state: 'Pending',
        source: {group: 'SZP', host: 'swawz', ipAddr: '10.100.127.18', zone: 'braun'},
        destination: {group: 'SZD', host: 'bwawa', ipAddr: '20.030.168.17', zone: 'rot', port: '122-133'}
    },
    {
        id: '17', state: 'Implemented',
        source: {group: 'SZP', host: 'swbwz', ipAddr: '10.100.128.18', zone: 'rot'},
        destination: {group: 'SZD', host: 'swbwz', ipAddr: '20.030.168.17', zone: 'gelb', port: '16000'}
    },
    {
        id: '18', state: 'Implemented',
        source: {group: 'SZP', host: 'swawz', ipAddr: '10.100.127.18', zone: 'orange'},
        destination: {group: 'SZD', host: 'bwawa', ipAddr: '20.030.168.17', zone: 'rot', port: '8080'}
    },
    {
        id: '19', state: 'Deleted',
        source: {group: 'SZP', host: 'swawz', ipAddr: '10.100.127.18', zone: 'orange'},
        destination: {group: 'SZD', host: 'bwawa', ipAddr: '20.030.168.17', zone: 'gelb', port: '8080, 8088'}
    },
    {
        id: '20', state: 'Pending',
        source: {group: 'SZP', host: 'swawz', ipAddr: '10.100.127.18', zone: 'braun'},
        destination: {group: 'SZD', host: 'bwawa', ipAddr: '20.030.168.17', zone: 'rot', port: '10'}
    },

    {
        id: '21', state: 'Pending',
        source: {group: 'SZP', host: 'swawz', ipAddr: '10.100.127.18', zone: 'braun'},
        destination: {group: 'SZD', host: 'bwawa', ipAddr: '20.030.168.17', zone: 'rot', port: '122-133'}
    },
    {
        id: '22', state: 'Implemented',
        source: {group: 'SZP', host: 'swbwz', ipAddr: '10.100.128.18', zone: 'rot'},
        destination: {group: 'SZD', host: 'swbwz', ipAddr: '20.030.168.17', zone: 'gelb', port: '16000'}
    },
    {
        id: '23', state: 'Implemented',
        source: {group: 'SZP', host: 'swawz', ipAddr: '10.100.127.18', zone: 'orange'},
        destination: {group: 'SZD', host: 'bwawa', ipAddr: '20.030.168.17', zone: 'rot', port: '8080'}
    },
    {
        id: '24', state: 'Deleted',
        source: {group: 'SZP', host: 'swawz', ipAddr: '10.100.127.18', zone: 'orange'},
        destination: {group: 'SZD', host: 'bwawa', ipAddr: '20.030.168.17', zone: 'gelb', port: '8080, 8088'}
    },
    {
        id: '25', state: 'Pending',
        source: {group: 'SZP', host: 'swawz', ipAddr: '10.100.127.18', zone: 'braun'},
        destination: {group: 'SZD', host: 'bwawa', ipAddr: '20.030.168.17', zone: 'rot', port: '10'}
    },

    {
        id: '26', state: 'Pending',
        source: {group: 'SZP', host: 'swawz', ipAddr: '10.100.127.18', zone: 'braun'},
        destination: {group: 'SZD', host: 'bwawa', ipAddr: '20.030.168.17', zone: 'rot', port: '122-133'}
    },
    {
        id: '27', state: 'Implemented',
        source: {group: 'SZP', host: 'swbwz', ipAddr: '10.100.128.18', zone: 'rot'},
        destination: {group: 'SZD', host: 'swbwz', ipAddr: '20.030.168.17', zone: 'gelb', port: '16000'}
    },
    {
        id: '28', state: 'Implemented',
        source: {group: 'SZP', host: 'swawz', ipAddr: '10.100.127.18', zone: 'orange'},
        destination: {group: 'SZD', host: 'bwawa', ipAddr: '20.030.168.17', zone: 'rot', port: '8080'}
    },
    {
        id: '29', state: 'Deleted',
        source: {group: 'SZP', host: 'swawz', ipAddr: '10.100.127.18', zone: 'orange'},
        destination: {group: 'SZD', host: 'bwawa', ipAddr: '20.030.168.17', zone: 'gelb', port: '8080, 8088'}
    },
    {
        id: '30', state: 'Pending',
        source: {group: 'SZP', host: 'swawz', ipAddr: '10.100.127.18', zone: 'braun'},
        destination: {group: 'SZD', host: 'bwawa', ipAddr: '20.030.168.17', zone: 'rot', port: '10'}
    },

    {
        id: '31', state: 'Pending',
        source: {group: 'SZP', host: 'swawz', ipAddr: '10.100.127.18', zone: 'braun'},
        destination: {group: 'SZD', host: 'bwawa', ipAddr: '20.030.168.17', zone: 'rot', port: '122-133'}
    },
    {
        id: '32', state: 'Implemented',
        source: {group: 'SZP', host: 'swbwz', ipAddr: '10.100.128.18', zone: 'rot'},
        destination: {group: 'SZD', host: 'swbwz', ipAddr: '20.030.168.17', zone: 'gelb', port: '16000'}
    },
    {
        id: '33', state: 'Implemented',
        source: {group: 'SZP', host: 'swawz', ipAddr: '10.100.127.18', zone: 'orange'},
        destination: {group: 'SZD', host: 'bwawa', ipAddr: '20.030.168.17', zone: 'rot', port: '8080'}
    },
    {
        id: '34', state: 'Deleted',
        source: {group: 'SZP', host: 'swawz', ipAddr: '10.100.127.18', zone: 'orange'},
        destination: {group: 'SZD', host: 'bwawa', ipAddr: '20.030.168.17', zone: 'gelb', port: '8080, 8088'}
    },
    {
        id: '35', state: 'Pending',
        source: {group: 'SZP', host: 'swawz', ipAddr: '10.100.127.18', zone: 'braun'},
        destination: {group: 'SZD', host: 'bwawa', ipAddr: '20.030.168.17', zone: 'rot', port: '10'}
    },

    {
        id: '36', state: 'Pending',
        source: {group: 'SZP', host: 'swawz', ipAddr: '10.100.127.18', zone: 'braun'},
        destination: {group: 'SZD', host: 'bwawa', ipAddr: '20.030.168.17', zone: 'rot', port: '122-133'}
    },
    {
        id: '37', state: 'Implemented',
        source: {group: 'SZP', host: 'swbwz', ipAddr: '10.100.128.18', zone: 'rot'},
        destination: {group: 'SZD', host: 'swbwz', ipAddr: '20.030.168.17', zone: 'gelb', port: '16000'}
    },
    {
        id: '38', state: 'Implemented',
        source: {group: 'SZP', host: 'swawz', ipAddr: '10.100.127.18', zone: 'orange'},
        destination: {group: 'SZD', host: 'bwawa', ipAddr: '20.030.168.17', zone: 'rot', port: '8080'}
    },
    {
        id: '39', state: 'Deleted',
        source: {group: 'SZP', host: 'swawz', ipAddr: '10.100.127.18', zone: 'orange'},
        destination: {group: 'SZD', host: 'bwawa', ipAddr: '20.030.168.17', zone: 'gelb', port: '8080, 8088'}
    },
    {
        id: '40', state: 'Pending',
        source: {group: 'SZP', host: 'swawz', ipAddr: '10.100.127.18', zone: 'braun'},
        destination: {group: 'SZD', host: 'bwawa', ipAddr: '20.030.168.17', zone: 'rot', port: '10'}
    },

    {
        id: '41', state: 'Pending',
        source: {group: 'SZP', host: 'swawz', ipAddr: '10.100.127.18', zone: 'braun'},
        destination: {group: 'SZD', host: 'bwawa', ipAddr: '20.030.168.17', zone: 'rot', port: '122-133'}
    },
    {
        id: '42', state: 'Implemented',
        source: {group: 'SZP', host: 'swbwz', ipAddr: '10.100.128.18', zone: 'rot'},
        destination: {group: 'SZD', host: 'swbwz', ipAddr: '20.030.168.17', zone: 'gelb', port: '16000'}
    },
    {
        id: '43', state: 'Implemented',
        source: {group: 'SZP', host: 'swawz', ipAddr: '10.100.127.18', zone: 'orange'},
        destination: {group: 'SZD', host: 'bwawa', ipAddr: '20.030.168.17', zone: 'rot', port: '8080'}
    },
    {
        id: '44', state: 'Deleted',
        source: {group: 'SZP', host: 'swawz', ipAddr: '10.100.127.18', zone: 'orange'},
        destination: {group: 'SZD', host: 'bwawa', ipAddr: '20.030.168.17', zone: 'gelb', port: '8080, 8088'}
    },
    {
        id: '45', state: 'Pending',
        source: {group: 'SZP', host: 'swawz', ipAddr: '10.100.127.18', zone: 'braun'},
        destination: {group: 'SZD', host: 'bwawa', ipAddr: '20.030.168.17', zone: 'rot', port: '10'}
    }
];



var userId;
var jwtToken;
var projectId;

async.series([
    function(cb) {
        console.log('Create User');
        test.frisby.create('Create User')
            .post(test.USERS_REST_URL, {
                email: USER_EMAIL,
                password: "a"
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
        createNwsw(nwsws, 0, cb);
    }
]);


function createNwsw(nwsws, idx, cb) {
    if (idx >= nwsws.length) {
        return; // if test is run createNwsw is run by async.series as well as stand-alone -> don't do anything when run stand-alone
    }
    nwsws[idx].creationDate = new Date();
    nwsws[idx].creationBy = USER_EMAIL;

    test.frisby.create('Create network switching')
        .addHeader('authorization', 'Bearer ' + jwtToken)
        .post(test.NWSWS_REST_URL + "/" + projectId, nwsws[idx], {json: true})
        .expectStatus(200)
        .after(function (json) {
            ++idx;
            if (idx >= nwsws.length) {
                console.log("createNwsw idx=", idx);
                cb(null);
            }
            createNwsw(nwsws, idx, cb);
        })
        .toss();
}
