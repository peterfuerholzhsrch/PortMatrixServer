"use strict";


var util = require('../util/security');
var usersStore = require("../services/usersStore.js");
var projectsStore = require("../services/projectsStore.js");
var networkswitchingsStore = require("../services/networkswitchingsStore.js");
var security = require("../util/security.js");



function Project(userId, admin) {
    this.adminId = userId;
    this.users = [];
    this.name = admin + "'s project";
    this.creationDate = new Date();
}


module.exports.login = function(req, res, next) {
    util.handleLogin(req, res, next);
};


module.exports.registerUser = function(req, res, next) {

    return usersStore.registerUserPr(req.body.email, req.body.password)
        .then(function(newUser) {

            var referencedProject = req.body.referencedProject;
            if (referencedProject) {
                // add user to referenced project:
                projectsStore.addUserToProjectPr(referencedProject, newUser._id)
                    .then(function(project) {
                        return sendUserProjectAndToken(req.app, res, req.body.email, newUser, project);
                    }, function(err) {
                        next(err);
                    });
            }
            else {
                // create new project:
                projectsStore.insertProjectPr(new Project(newUser._id, req.body.email))
                    .then(function(project) {
                        return sendUserProjectAndToken(req.app, res, req.body.email, newUser, project);
                    }, function(err) {
                        next(err);
                    });
            }
        }, function(err) {
            next(err);
        });
};


function sendUserProjectAndToken(app, res, email, user, project) {
    var jsonWebTokenObject = security.createWebTokenObject(app, email, user);
    jsonWebTokenObject = Object.assign(jsonWebTokenObject, {project: project});
    res.jsonp(jsonWebTokenObject);
    res.end();
}


module.exports.deleteUser = function(req, res, next) {
    var userId = req.params.userId;
    return projectsStore.getOwnProjectByUserPr(userId)
        .then(function(project) { deleteNetworkswitchingsAndProjectPr(project._id); })
        // deleteUser even if project could not be found (deleteUserPr will fail anyway if user could not be found...)
        .then(/*onFulfilled*/function() { usersStore.deleteUserPr(userId) },
              /*onRejected*/function() { usersStore.deleteUserPr(userId) })
        .then(function() { res.end(userId) })
        .catch(function(err) { next(err); });
};


//
// project centric functions
//


module.exports.getProjectsByUser = function (req, res, next) {
    projectsStore.getOwnProjectByUserPr(req.query.userId)
        .then(function (doc) {
                var projects = [];
                if (doc) {
                    projects.push(doc);
                }

                var assignedToo = req.query.assignedToo && req.query.assignedToo.toLowerCase() == 'true';
                if (assignedToo) {
                    projectsStore.getAssignedProjectsByUserPr(req.query.userId)
                        .then(function(docs) {
                                projects = projects.concat(docs);
                                console.log('ctr.getProjectsByUser', 'projects =', projects);
                                res.type('application/json');
                                res.jsonp({ data: projects });
                                res.end();
                            }, function (err) {
                                next(err);
                            });
                }
                else {
                    console.log('ctr.getProjectsByUser', 'projects =', projects);
                    res.type('application/json');
                    res.jsonp({ data: projects });
                    res.end();
                }
            },
            function (err) {
                next(err);
            });
};


module.exports.saveProject = function (req, res, next) {
    console.log("usersAndProjectsController", "req.body", req.body);

    projectsStore.saveProjectPr(req.body)
        .then(
            function (doc) {
                console.log('ctr.saveProject', 'doc =', doc);
                res.type('application/json');
                res.jsonp(doc);
                res.end();
            },
            function(err) {
                next(err);
            });
};


module.exports.deleteProject = function (req, res, next) {
    deleteNetworkswitchingsAndProjectPr(req.param.id).next(
        function(ok) {
            // nothing
        }, function(err) {
            next(err);
        });
};


function deleteNetworkswitchingsAndProjectPr(projectId) {
    console.log("usersAndProjectsController", "projectId", projectId);

    return networkswitchingsStore.deleteNetworkswitchingsByProjectPr(projectId)
        .then(function(ok) {
            return projectsStore.deleteProjectPr(projectId)
        });
}
