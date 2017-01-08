"use strict";
/**
 * Created by pfu on 06/01/17.
 */

var BASE_URL = 'http://localhost:3001';
var USERS_REST_URL = BASE_URL + '/api/users';
var PROJECTS_REST_URL = BASE_URL + '/api/project';

var frisby = require('frisby');

frisby.create('Create a User')
    .post(USERS_REST_URL, {  // default encoding is 'application/x-www-form-urlencoded'
        email: "info@peter-fuerholz.ch",
        password: "1234"
    })
    .expectStatus(200)
    .inspectBody()

    .afterJSON(function(json) {
        frisby.create('Delete the User')
            .delete(USERS_REST_URL, json)
            .expectStatus(200)
            .inspectBody()
            .toss();
    })
    .toss();
