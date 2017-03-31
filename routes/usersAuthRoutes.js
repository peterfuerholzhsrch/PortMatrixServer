'use strict';


/**
 * The users router module where the user must be authenticated.
 */

var express = require('express');
var router = express.Router();
var usersAndProjectsController = require('../controller/usersAndProjectsController');

router.delete('/users/:userId', usersAndProjectsController.deleteUser);
router.post('/usersmail', usersAndProjectsController.inviteColleagues);

module.exports = router;