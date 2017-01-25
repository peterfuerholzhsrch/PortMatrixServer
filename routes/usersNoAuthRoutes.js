"use strict";
/**
 * Created by pfu on 26/10/16.
 *
 * The router module.
 */

var express = require('express');
var router = express.Router();
var usersAndProjectsController = require('../controller/usersAndProjectsController');

router.post("/api/login", usersAndProjectsController.login);

// Message body contains the user to insert. The URL can tell to which project the user shall be added:
// <code>/api/users?projectId=<ID></code>. If no <code>projectId</code> is provided a new project is created.
router.post("/api/users", usersAndProjectsController.registerUser);

module.exports = router;