"use strict";

/**
 * The controller module for users and projects.
 */

var util = require('../util/security');
var usersStore = require("../services/usersStore.js");
var projectsStore = require("../services/projectsStore.js");
var networkswitchingsStore = require("../services/networkswitchingsStore.js");
var security = require("../util/security.js");
const winston = require('winston');
var nodemailer = require('nodemailer');
var app = require('../server');


// configure log:
var LOG_LABEL = 'users-and-projects-controller';
winston.loggers.add(LOG_LABEL, {
    console: {
        label: LOG_LABEL
    }
});
var log = winston.loggers.get(LOG_LABEL);


// configure sending emails:
var smtpConfig = app.settings.smtpConfig;

if (!smtpConfig) {
    log.error("smtpConfig is not set!");
    console.log("Please set environment variable PORTMATRIX_SMTP_CONFIG with a value in the following format:");
    console.log("smtps://<smtp-user>:<smtp-password>@<smtp-server>");
    console.log("");
    console.log("For more information see: https://nodemailer.com/smtp");
    process.exit(1);
}

// create reusable transporter object using the default SMTP transport
let transporter = nodemailer.createTransport(smtpConfig);
// Alternative configuration:
//     {
//     //service: 'vtxmail',
//     port: '587',
//     host: 'asmtp.mail.hostpoint.ch',
//     secure: false,
//     auth: {
//         user: 'portmatrix@neshendra.ch',
//         pass: '<your password>'
//     }
// });


/**
 * Class Project (Definition of a Project on the server side)
 * @param userId
 * @param admin
 * @constructor
 */
function Project(userId, admin) {
    this.adminId = userId;
    this.users = [];
    this.name = admin + "'s project";
    this.creationDate = new Date();
}


/**
 * Login method.
 * @param req
 * @param res
 * @param next
 */
module.exports.login = function(req, res, next) {
    util.handleLogin(req, res, next);
};


/**
 * Register a new user. Depending on parameters in req a new project is created for the user or the user is added to
 * an existing project.
 * @param req
 * @param res
 * @param next
 * @returns {Promise.<TResult>|*}
 */
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


/**
 * Send project and user's JWT token to res.
 * @param app
 * @param res
 * @param email
 * @param user
 * @param project
 */
function sendUserProjectAndToken(app, res, email, user, project) {
    var jsonWebTokenObject = security.createWebTokenObject(app, email, user);
    jsonWebTokenObject = Object.assign(jsonWebTokenObject, {project: project});
    res.jsonp(jsonWebTokenObject);
    res.end();
}


/**
 * Delete a users and updates its relation to projects:
 * - If user is associated user to a project: User is removed from project.
 * - If user is project admin (creator) the ownership is passed over to first associated user. If there are not any
 *   associated users the project and its network switchings are deleted as well.
 *
 * @param req
 * @param res
 * @param next
 * @returns {*|Promise.<T>}
 */
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
            var promises = [];
            for (const project of projects) {
                var idxToRemove = project.users.indexOf(userId);
                project.users.splice(idxToRemove, 1);
                promises.push(projectsStore.saveProjectPr(project).then(function() { return Promise.resolve(null); }));
            }
            return Promise.all(promises);
        })
        .then(function (projectId) {
            if (typeof projectId === "string") {
                return deleteNetworkswitchingsAndProjectPr(projectId);
            } // otherwise it is an array
            return Promise.resolve(null);
        })
        // deleteUser even if project could not be found (deleteUserPr will fail anyway if user could not be found...)
        .then(/*onFulfilled*/function() { usersStore.deleteUserPr(userId) },
              /*onRejected*/function() { usersStore.deleteUserPr(userId) })
        .then(function() { res.end(userId) })
        .catch(function(err) { next(err); });
};


/**
 * Sends an email to each email address contained in req to invite using set project.
 * @param req
 * @param res
 * @param next
 */
module.exports.inviteColleagues = function(req, res, next) {
    var projectId = req.body.projectId;
    var adminId = req.body.adminId;
    var recipients = req.body.recipients;

    var recipientsStr = recipients.join(", ");

    usersStore.getUserPr(adminId)
        .then(function(user) {
            let mailOptions = {
                from: '"PortMatrix" <portmatrix@neshendra.ch>', // sender address
                to: recipientsStr, // list of receivers
                subject: "Invitation to take part in " + user.email + "'s PortMatrix Project", // Subject line
                html: buildUpInvitionEmailMessage(getHostPortString(req), user, projectId) // html body
            };

            // send mail with defined transport object
            transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                    log.error(error);
                    next(error);
                    return;
                }
                log.info('Message %s sent: %s', info.messageId, info.response);
                res.end();
            });
        })
        .catch(function (error) {
            next(error);
        });

};


/**
 * @param req
 * @returns {string} server host name
 */
function getHostPortString(req) {
    var url = req.headers.referer;
    var idxOfProtocol = url.indexOf('//');
    var idxOfPath = url.indexOf('/', idxOfProtocol + 2);
    return url.substring(0, idxOfPath > 0 ? idxOfPath : url.length);
}

/**
 * @param hostPortString
 * @param user
 * @param projectId
 * @returns {string} HTML string containing the email body to send to the invitees
 */
function buildUpInvitionEmailMessage(hostPortString, user, projectId) {
    return ["<p>Hi</p>",
            user.email + " has invited you to take part in his/her PortMatrix project.<br>",
            "Click <a href='" + hostPortString + "/user?assignedProject=" + projectId + "'>here</a> and sign up ",
            "to join! ",
            "<p>Kind regards,<br>",
            "PortMatrix-App (On behalf of " + user.email + ")</p>"].join('\n');
}



//
// project centric functions
//

/**
 * Load a project
 * @param req
 * @param res
 * @param next
 */
module.exports.getProject = function (req, res, next) {
    projectsStore.getProjectByIdPr(req.params.projectId)
        .then(function (project) {
                log.info('getProject', 'project =', project);
                res.type('application/json');
                res.jsonp(project);
                res.end();
            },
            function (err) {
                next(err);
            });
};


/**
 * Load projects of a user.
 * @param req
 * @param res
 * @param next
 */
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
                log.info('getProjectsByUser', 'projects =', projects);
                res.type('application/json');
                res.jsonp({ data: projects });
                res.end();
            },
            function (err) {
                next(err);
            });
};


/**
 * Save a project.
 * @param req
 * @param res
 * @param next
 */
module.exports.saveProject = function (req, res, next) {
    log.d("saveProject", "req.body", req.body);

    projectsStore.saveProjectPr(req.body)
        .then(
            function (doc) {
                log.info('saveProject', 'doc =', doc);
                res.type('application/json');
                res.jsonp(doc);
                res.end();
            },
            function(err) {
                next(err);
            });
};


/**
 * Delete a project
 * @param req
 * @param res
 * @param next
 */
module.exports.deleteProject = function (req, res, next) {
    deleteNetworkswitchingsAndProjectPr(req.param.id).next(
        function(ok) {
            // nothing
        }, function(err) {
            next(err);
        });
};


/**
 * Delete a project and its referenced network switchings.
 * @param projectId
 * @returns {*|Promise.<TResult>}
 */
function deleteNetworkswitchingsAndProjectPr(projectId) {
    log.info("deleteNetworkswitchingsAndProjectPr", "projectId", projectId);

    return networkswitchingsStore.deleteNetworkswitchingsByProjectPr(projectId)
        .then(function(ok) {
            return projectsStore.deleteProjectPr(projectId)
        });
}
