"use strict";
/**
 * Created by pfu on 26/10/16.
 *
 * The router module.
 */

var express = require('express');
var router = express.Router();
var usersAndProjectsController = require('../controller/usersAndProjectsController');

router.delete("/users/:userId", usersAndProjectsController.deleteUser);
router.post("/usersmail", usersAndProjectsController.inviteColleagues);

module.exports = router;