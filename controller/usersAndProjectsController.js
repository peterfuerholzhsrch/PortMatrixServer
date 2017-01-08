var util = require('../util/security');
var usersStore = require("../services/usersStore.js");
var projectsStore = require("../services/projectsStore.js");
var networkswitchingsStore = require("../services/networkswitchingsStore.js");

var Promise = require('promise');


function Project(userId, admin) {
    this.adminId = userId;
    this.users = [];
    this.name = admin + "'s project";
    this.creationDate = new Date();
}


module.exports.login = function(req, res, next) {
    util.handleLogin(req, res);
};

module.exports.registerUser = function(req, res, next) {
    usersStore.registerUser(req.body.email, req.body.password, function(err, newUser) {
        if (err) {
            next(err);
            return;
        }

        var referencedProject = req.body.referencedProject;
        if (referencedProject) {
           // add user to referenced project:
            projectsStore.addUserToProject(referencedProject, newUser._id, function(err, response) {
                if (err) {
                    next(err);
                    return;
                }
                res.jsonp(newUser);
                res.end();
            });
        }
        else {
           // create new project:
           projectsStore.insertProject(new Project(newUser._id, req.body.email), function(err, doc) {
               if (err) {
                   next(err);
                   return;
               }
               res.jsonp(newUser);
               res.end();
           });
        }
    });
};



var getOwnProjectByUserPr = Promise.denodeify(projectsStore.getOwnProjectByUser);
var deleteProjectPr = Promise.denodeify(deleteProject);
var deleteUserPr = Promise.denodeify(usersStore.deleteUser);

module.exports.deleteUser = function(req, res, next) {
    var userId = req.body.userId;
    return getOwnProjectByUserPr(userId)
        .then(function(project) { deleteProjectPr(project._id); })
        // deleteUser even if project could not be found (deleteUserPr will fail anyway if user could not be found...)
        .then(/*onFulfilled*/function() { deleteUserPr(userId) }, /*onRejected*/function() { deleteUserPr(userId) })
        .then(function() { res.end(userId) });
};


//
// project centric functions
//


/**
 * @param req userid is expected in query (see routes); If assignedToo = true the projects where this user is a user is
 * returned as well.
 * @param res
 * @param next
 */
module.exports.getProjectsByUser = function (req, res, next) {
    projectsStore.getOwnProjectByUser(req.query.userId,
        function (err, doc) {
            if (err) {
                next(err);
                return;
            }

            var projects = [];
            if (doc) {
                projects.push(doc);
            }

            var assignedToo = req.query.assignedToo && req.query.assignedToo.toLowerCase() == 'true';
            if (assignedToo) {
                projectsStore.getAssignedProjectsByUser(req.query.userId, function(err, docs) {
                    if (err) {
                        next(err);
                        return;
                    }
                    projects = projects.concat(docs);
                    console.log('ctr.getProjectsByUser', 'projects =', projects);
                    res.type('application/json');
                    res.jsonp({ data: projects });
                    res.end();
                })
            }
            else {
                console.log('ctr.getProjectsByUser', 'projects =', projects);
                res.type('application/json');
                res.jsonp({ data: projects });
                res.end();
            }
        });
};


module.exports.saveProject = function (req, res, next) {
    console.log("usersAndProjectsController", "req.body", req.body);

    store.saveProject(req.body,
        function (err, doc) {
            if (err) {
                next(err);
                return;
            }
            console.log('ctr.saveProject', 'doc =', doc);
            res.type('application/json');
            res.jsonp(doc);
            res.end();
        });
};


insertProject = function (req, res, next) {
    console.log("usersAndProjectsController", "req.body", req.body);

    store.insertProject(req.body,
        function (err, doc) {
            if (err) {
                next(err);
                return;
            }
            if (doc) {
                console.log('ctr.insertProject', 'doc =', doc);
                res.type('application/json');
                res.jsonp(doc);
                res.end();
            }
        });
};

module.exports.deleteProject = function (req, res, next) {
    deleteProject(req.param.id, next);
};

function deleteProject(projectId, callback) {
    console.log("usersAndProjectsController", "projectId", projectId);

    networkswitchingsStore.deleteNetworkswitchingsByProject(projectId, function(err) {
        if (err) {
            callback(err);
            return;
        }
        projectsStore.deleteProject(projectId,
            function (err) {
                console.log('ctr.deleteProject ' + (err ? 'Not OK' : 'Ok'));
                if (callback) {
                    callback(err, projectId);
                }
            });
    });
}
