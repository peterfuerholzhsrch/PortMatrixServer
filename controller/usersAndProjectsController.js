"use strict";


var util = require('../util/security');
var usersStore = require("../services/usersStore.js");
var projectsStore = require("../services/projectsStore.js");
var networkswitchingsStore = require("../services/networkswitchingsStore.js");
var security = require("../util/security.js");

const nodemailer = require('nodemailer');

var smtpConfig = process.env.PORTMATRIX_SMTP_CONFIG;

if (!smtpConfig) {
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
                html: buildEmailMessage(user, projectId) // html body
            };

            // send mail with defined transport object
            transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                    console.log(error);
                    next(error);
                    return;
                }
                console.log('Message %s sent: %s', info.messageId, info.response);
            });
            res.end();
        })
        .catch(function (error) {
            next(error);
        });

};


function buildEmailMessage(user, projectId) {
    return ["<p>Hi</p>",
            user.email + " has invited you to take part in his/her PortMatrix project.<br>",
            "Click <a href='http://localhost:4200/user?assignedProject=" + projectId + "'>here</a> and sign up ",
            "to join! ",
            "<p>Kind regards,<br>",
            "PortMatrix-App (On behalf of " + user.email + ")</p>"].join('\n');
}



//
// project centric functions
//

module.exports.getProject = function (req, res, next) {
    projectsStore.getProjectByIdPr(req.params.projectId)
        .then(function (project) {
                console.log('ctr.getProject', 'project =', project);
                res.type('application/json');
                res.jsonp(project);
                res.end();
            },
            function (err) {
                next(err);
            });
};


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
