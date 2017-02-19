"use strict";


var express = require('express');
var usersAndProjectsController = require('../controller/usersAndProjectsController');

var router = express.Router();

router.get("/:projectId/", usersAndProjectsController.getProject);

// Following format supported: /api/projects?userId=<ID>[&assignedToo=true|false]
router.get("/", usersAndProjectsController.getProjectsByUser);

router.delete("/", usersAndProjectsController.deleteProject);

module.exports = router;