"use strict";
/**
 * Created by pfu on 26/10/16.
 *
 * The project store (= persistence layer). A project combines an admin (type User), his coworkers (type User) with
 * their network switchings.
 */

var Datastore = require('nedb');
var db = new Datastore({ filename: './data/projects.db', autoload: true });

// set index on 'adminId' since this is mostly requested
db.ensureIndex({ fieldName: "adminId", unique: true }, function(error) { if (error) { throw error; } });


var Promise = require('promise');

var dbFindOnePr = Promise.denodeify(db.findOne);
var dbUpdatePr = Promise.denodeify(db.update);
var dbInsertPr = Promise.denodeify(db.insert);

/**
 * Seeks the project where 'id' is set as admin.
 * @param id
 * @param callback
 */
function publicGetOwnProjectByUser(id, callback) {
    db.findOne({ adminId: id }, function(err, foundDoc) {
        console.log("projectsStore.publicGetOwnProjectByUser", "adminId", id, "found", foundDoc);
        if (callback) {
            callback(err, foundDoc);
        }
    });
}


function publicGetProjectById(id, callback) {
    db.findOne({ _id: id }, function(err, foundDoc) {
        console.log("projectsStore.publicGetProjectById", "id", id, "found", foundDoc);
        if (callback) {
            callback(err, foundDoc);
        }
    });
}


/**
 * Seeks all projects where 'id' is set as user.
 * @param id
 * @param callback
 */
function publicGetAssignedProjectsByUser(id, callback) {
    db.find({ users: id }, function(err, foundDocs) {
        console.log("projectsStore.publicGetAssignedProjectsByUser", "id", id, "found", foundDocs);
        if (callback) {
            callback(err, foundDocs);
        }
    });
}


function publicSaveProject(project, callback) {
    if (project._id) {
        db.update({_id: project._id}, project, {}/*options*/, function(err, numReplaced) {
            if (err) {
                console.log("error", err);
            }
            if (numReplaced) {
                console.log('Documents updated: ', numReplaced);
            }
            if (callback) {
                callback(err, numReplaced);
            }
        } );
    }
    else {
        db.insert(project, function(err, newDoc) {
            if (err) {
                console.log("error", err);
            }
            if (newDoc) {
                console.log('Documents inserted: ', newDoc);
            }
            if (callback) {
                callback(err, newDoc);
            }
        });
    }
}


function publicSaveProjectPr(project) {
    if (project._id) {
        dbUpdatePr({_id: project._id}, project, {}/*options*/)
            .then(function(err, numReplaced) {
                console.log('Documents updated: ', numReplaced);
                return numReplaced;
            });
    }
    else {
        dbInsertPr(project)
            .then(function(err, newDoc) {
                if (newDoc) {
                    console.log('Documents inserted: ', newDoc);
                }
                return newDoc;
            });
    }
}



function publicInsertProject(project, callback) {
    if (!project) {
        throw new Error("Project must not be null!")
    }
    if (!project.adminId) {
        throw new Error("Project's admin must not be null!");
    }

    db.insert(project, function(err, newDoc) {
        if (err) {
            console.log("error", err);
        }
        if (newDoc) {
            console.log('Documents inserted: ', newDoc);
        }
        if (callback) {
            callback(err, newDoc);
        }
    });
}


function publicAddUserToProjectPr(projectId, userId) {
    if (!projectId) {
        throw new Error("ProjectId must not be null!")
    }
    if (!userId) {
        throw new Error("UserId must not be null!");
    }
    return dbFindOnePr({ _id: projectId })
        .then(function(err, project) {
            console.log("projectsStore.publicGetProjectByUser", "userId", userId, "found", project);

            if (!project.users) {
                project.users = [];
            }
            if (!project.users.contains(userId)) {
                project.users.push(userId);
                return publicSaveProjectPr(project);
            }
            else {
                console.log("UserId=" + userId + " already added to project with id=" + projectId + "!");
                return project;
            }
        });
}



/*
function publicAddUserToProject(projectId, userId, callback) {
    if (!projectId) {
        throw new Error("ProjectId must not be null!")
    }
    if (!userId) {
        throw new Error("UserId must not be null!");
    }
    var project = db.findOne({ _id: projectId }, function(err, project) {
        if (err) {
            if (callback) {
                callback(err);
            }
            return;
        }

        console.log("projectsStore.publicGetProjectByUser", "userId", userId, "found", project);

        if (!project) {
            if (callback) {
                callback("no project where user could be added!");
            }
            return;
        }

        if (!project.users) {
            project.users = [];
        }
        if (project.users.indexOf(userId) < 0) {
            project.users.push(userId);
            publicSaveProject(project, callback);
        }
        else {
            console.log("UserId=" + userId + " already added to project with id=" + projectId + "!");
            callback(null, "already added");
        }
    });
}*/


function publicDeleteProject(id, callback) {
    db.remove({ _id: id }, {}, function(err, foundDoc){
        console.log("networkswitchingsStore.publicDeleteNetworkswitching", "id", id, "found", foundDoc);
        if (callback){
            callback(err, foundDoc);
        }
    })
}


module.exports = {
    getOwnProjectByUser : publicGetOwnProjectByUser,
    getProjectById : publicGetProjectById,
    getAssignedProjectsByUser : publicGetAssignedProjectsByUser,
    saveProject : publicSaveProject,
    insertProject : publicInsertProject,
//    addUserToProject : publicAddUserToProject,
    deleteProject : publicDeleteProject };