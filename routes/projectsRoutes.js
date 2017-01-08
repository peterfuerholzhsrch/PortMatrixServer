var express = require('express');
var usersAndProjectsController = require('../controller/usersAndProjectsController');

var router = express.Router();

// Following format supported: /api/projects?userId=<ID>
router.get("/", usersAndProjectsController.getProjectsByUser);

//router.post("/api/projects", usersAndProjectsController.insertProject);

router.delete("/", usersAndProjectsController.deleteProject);


/*
router.get("/login", function(req, res){
    usersController.isLoggedIn(req,res);
});

router.post("/logout", function(req, res){
    usersController.logout(req,res);
});
*/

module.exports = router;