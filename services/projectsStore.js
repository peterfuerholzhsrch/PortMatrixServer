'use strict';

/**
 * The project store (= persistence layer). A project combines an admin (type User), his coworkers (type User) with
 * their network switchings.
 */

const winston = require('winston');
var Promise = require('promise');
var Datastore = require('nedb-promise');

var LOG_LABEL = 'projects-store';
winston.loggers.add(LOG_LABEL, {
    console: {
        label: LOG_LABEL
    }
});
var log = winston.loggers.get(LOG_LABEL);

var db = new Datastore({ filename: './data/projects.db', autoload: true });

// set index on 'adminId' since this is mostly requested
db.ensureIndex({ fieldName: 'adminId', unique: true }, function(error) { if (error) { throw error; } });


/**
 * Check if project with set projectId exists.
 * @param projectId
 * @returns {*|Promise.<TResult>}
 */
function publicCheckProjectExists(projectId) {
    return db.findOne({ _id: projectId }).then(function(foundDoc) {
        return foundDoc ? Promise.resolve(foundDoc) : Promise.reject('No project available under set ID=' + projectId);
    });
}


/**
 * Get project be projectId
 * @param projectId
 * @returns {*|Promise.<TResult>}
 */
function publicGetProjectByIdPr(projectId) {
    return db.findOne({ _id: projectId })
        .then(function(foundDoc){
            log.info('publicGetProjectByIdPr', '_id', projectId, 'found', foundDoc);
            return Promise.resolve(foundDoc);
        });

}


/**
 * Get projects by userId. The projects are sorted that the projects are returned first where the user is admin (=owner)
 * and then where he is user only.
 * @param userId
 * @returns {*|Promise.<TResult>}
 */
function publicGetProjectsByUserIdPr(userId) {
    return db.find({ '$or': [{ adminId:   userId },
                             { users: userId }] })
        .then(function(foundDocs) {
            // admins at front:
            var admin = foundDocs.filter(function(doc) { return doc.adminId == userId});
            var users = foundDocs.filter(function(doc) { return doc.adminId != userId});
            foundDocs = admin.concat(users);
            log.info('publicGetProjectById', 'adminId', userId, 'found', foundDocs);
            return Promise.resolve(foundDocs);
        });
}


/**
 * Updates a project.
 * @param project
 * @returns {*|Promise.<TResult>}
 */
function publicSaveProjectPr(project) {
    return db.update({_id: project._id}, project, {}/*options*/)
        .then(function(numReplaced) {
            log.info('publicSaveProjectPr, Projects updated: ', numReplaced);
            return Promise.resolve(project);
        });
}


/**
 * Creates a projects.
 * @param project
 * @returns {*|Promise.<TResult>}
 */
function publicInsertProjectPr(project) {
    if (!project) {
        throw new Error('Project must not be null!')
    }
    if (!project.adminId) {
        throw new Error('Project\'s admin must not be null!');
    }

    return db.insert(project).then((newDoc) => {
        if (newDoc) {
            log.info('publicInsertProjectPr, Project inserted: ', newDoc);
        }
        return Promise.resolve(newDoc);
    });
}


/**
 * Adds a user to an existing project.
 * @param projectId
 * @param userId
 * @returns {*|Promise.<TResult>}
 */
function publicAddUserToProjectPr(projectId, userId) {
    if (!projectId) {
        throw new Error('ProjectId must not be null!')
    }
    if (!userId) {
        throw new Error('UserId must not be null!');
    }
    return db.findOne({ _id: projectId })
        .then(function(project) {
            log.info('publicAddUserToProjectPr', 'userId', userId, 'found', project);

            if (!project.users) {
                project.users = [];
            }
            if (project.users.indexOf(userId) < 0) {
                project.users.push(userId);
                return publicSaveProjectPr(project);
            }
            log.info('publicAddUserToProjectPr, UserId=', userId, ' already added to project with id=', projectId, '!');
            return Promise.resolve(project);
        });
}


/**
 * Deletes a project.
 * @param id
 */
function publicDeleteProjectPr(id) {
    return db.remove({ _id: id }, {})
        .then(function(foundDoc){
            log.info('publicDeleteProjectPr, Delete Project', 'id', id, 'found', foundDoc);
            return Promise.resolve(id);
        });
}


module.exports = {
    checkProjectExists: publicCheckProjectExists,
    getProjectByIdPr: publicGetProjectByIdPr,
    getProjectsByUserIdPr : publicGetProjectsByUserIdPr,
    saveProjectPr : publicSaveProjectPr,
    insertProjectPr : publicInsertProjectPr,
    addUserToProjectPr : publicAddUserToProjectPr,
    deleteProjectPr : publicDeleteProjectPr };