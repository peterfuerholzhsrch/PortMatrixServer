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
    var projectId;
    return projectsStore.getProjectsByUserIdPr(userId)
        .then(function(projects) {
            var adminProjects = projects.filter(function(project) { return project.adminId == userId});
            if (adminProjects.length > 0) {
                // A user can be only admin of 1 project (index controlled!)
                const project = adminProjects[0];
                // try to pass admin to next assigned user:
                if (project.users && project.users.length > 0) {
                    project.adminId = project.users.shift();
                    return projectsStore.saveProjectPr(project)
                        .then(function() { return null; }); // return null -> don't delete project and nwsws
                }
                return Promise.resolve(project._id);
            }
            // remove user in these projects:
            const lastProject = projects.length > 0 ? projects[projects.length - 1] : null;
            for (const project of projects) {
                var idxToRemove = project.users.indexOf(userId);
                project.users.splice(idxToRemove, 1);
                if (lastProject == project) {
                    projectsStore.saveProjectPr(project).then(function() { return Promise.resolve(null); });
                }
                else {
                    projectsStore.saveProjectPr(project);
                }
            }
            if (!lastProject) {
                return Promise.resolve(null); // user was assigned only, no project to delete
            }
        })
        .then(function (projectId) {
            if (projectId) {
                return deleteNetworkswitchingsAndProjectPr(projectId);
            }
            return Promise.resolve(null);
        })
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
    projectsStore.getProjectsByUserIdPr(req.query.userId)
        .then(function (docs) {
                var projects;
                if (req.query.assignedToo && req.query.assignedToo.toLowerCase() == 'true') {
                    projects = docs;
                }
                else {
                    // return admin only:
                    projects = docs.filter(function(doc) { return doc.adminId == req.query.userId });
                }
                console.log('ctr.getProjectsByUser', 'projects =', projects);
                res.type('application/json');
                res.jsonp({ data: projects });
                res.end();
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
