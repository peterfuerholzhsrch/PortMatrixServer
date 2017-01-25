"use strict";
/**
 * This test creates a user and deletes it afterwards.
 *
 * Created by pfu on 06/01/17.
 */

var test = require('./testSettings');


test.frisby.create('Create a User')
    .post(test.USERS_REST_URL, {
        email: "info@peter-fuerholz.ch",
        password: "1234"
    }, 'json')
    .expectStatus(200)
    .inspectBody()

    .afterJSON(function(json) {
        var jwtToken = json.token;
        console.log("json=" + JSON.stringify(json));

        test.frisby.create('Delete the User')
            .addHeader('authorization', 'Bearer ' + jwtToken)
            .delete(test.USERS_REST_URL + "/" + json.user._id)
            .expectStatus(200)
            .inspectBody()
            .toss();
    })
    .toss();
