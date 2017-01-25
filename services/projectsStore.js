"use strict";
/**
 * Created by pfu on 26/10/16.
 *
 * The project store (= persistence layer). A project combines an admin (type User), his coworkers (type User) with
 * their network switchings.
 */


var Promise = require('promise');

var Datastore = require('nedb-promise');
var db = new Datastore({ filename: './data/projects.db', autoload: true });

// set index on 'adminId' since this is mostly requested
db.ensureIndex({ fieldName: "adminId", unique: true }, function(error) { if (error) { throw error; } });


/**
 * Seeks the project where 'id' is set as admin.
 * @param id
 */
function publicGetOwnProjectByUserPr(id) {
    return db.findOne({ adminId: id })
        .then(function(foundDoc) {
            console.log("projectsStore.publicGetOwnProjectByUser", "adminId", id, "found", foundDoc);
            return Promise.resolve(foundDoc);
        });
}


function publicGetProjectByIdPr(id) {
    return db.findOne({ _id: id })
        .then(function(foundDoc) {
            console.log("projectsStore.publicGetProjectById", "id", id, "found", foundDoc);
            return Promise.resolve(foundDoc);
        });
}


/**
 * Seeks all projects where 'id' is set as user.
 * @param id
 */
function publicGetAssignedProjectsByUserPr(id) {
    return db.find({ users: id })
        .then(function(foundDocs) {
            console.log("projectsStore.publicGetAssignedProjectsByUser", "id", id, "found", foundDocs);
            return Promise.resolve(foundDocs);
        });
}


function publicSaveProjectPr(project) {
    return db.update({_id: project._id}, project, {}/*options*/)
        .then(function(numReplaced) {
            console.log('Projects updated: ', numReplaced);
            return Promise.resolve(project);
        });
}


function publicInsertProjectPr(project) {
    if (!project) {
        throw new Error("Project must not be null!")
    }
    if (!project.adminId) {
        throw new Error("Project's admin must not be null!");
    }

    return db.insert(project).then((newDoc) => {
        if (newDoc) {
            console.log('Project inserted: ', newDoc);
        }
        return Promise.resolve(newDoc);
    });
}


function publicAddUserToProjectPr(projectId, userId) {
    if (!projectId) {
        throw new Error("ProjectId must not be null!")
    }
    if (!userId) {
        throw new Error("UserId must not be null!");
    }
    return db.findOne({ _id: projectId })
        .then(function(project) {
            console.log("projectsStore.publicGetProjectByUser", "userId", userId, "found", project);

            if (!project.users) {
                project.users = [];
            }
            if (project.users.indexOf(userId) < 0) {
                project.users.push(userId);
                return publicSaveProjectPr(project);
            }
            console.log("UserId=" + userId + " already added to project with id=" + projectId + "!");
            return Promise.resolve(project);
        });
}


function publicDeleteProjectPr(id) {
    db.remove({ _id: id }, {})
        .then(function(foundDoc){
            console.log("Delete Project", "id", id, "found", foundDoc);
            return Promise.resolve(id);
        });
}


module.exports = {
    getOwnProjectByUserPr : publicGetOwnProjectByUserPr,
    getProjectByIdPr : publicGetProjectByIdPr,
    getAssignedProjectsByUserPr : publicGetAssignedProjectsByUserPr,
    saveProjectPr : publicSaveProjectPr,
    insertProjectPr : publicInsertProjectPr,
    addUserToProjectPr : publicAddUserToProjectPr,
    deleteProjectPr : publicDeleteProjectPr };