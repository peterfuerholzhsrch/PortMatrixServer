"use strict";

var Promise = require('promise');


/**
 * Created by pfu on 26/10/16.
 *
 * The network switching store (= persistence layer).
 */

var Datastore = require('nedb-promise');
var db = new Datastore({ filename: './data/networkswitchings.db', autoload: true });

// set index on 'id' to make it unique, but allow null value (!)
db.ensureIndex({ fieldName: "id", unique: true, sparse: true }, function(error) { if (error) { throw error; } });


var MAX_RECORDS_LIMIT = 1000;



/**
 * @param projectId referenced project
 * @param query query object
 * @param offset How many records shall be skipped (0=no skipping)
 * @param limit How many records shall be returned at max (is limited to MAX_RECORDS_LIMIT when not provided)
 * @param sorting sorting object
 * @param callback
 * @return Array Returns persistent notes.
 */
function publicGetNetworkswitchingsPr(query, offset, limit, sorting) {
    if (!sorting) {
        sorting = { "id": 1 }; // sort by id ascending
    }

    console.log("networkswitchingsStore, sorting=" + JSON.stringify(sorting) + ", offset=" + offset + ", limit=" + limit);

    return db.cfind(query)
        .sort(sorting)
        .skip(offset || 0)
        .limit(limit || MAX_RECORDS_LIMIT)
        .exec()
        .then(function (docs) {
            return Promise.resolve(docs);
        });
}


/**
 * @param nwswId
 * @returns {*|Promise.<TResult>}
 */
function publicGetNetworkswitchingPr(nwswId) {
    return db.findOne({ _id: nwswId })
        .then(function(foundDoc){
            console.log("networkswitchingsStore.publicGetNetworkswitching", "id", nwswId, "found", foundDoc);
            return Promise.resolve(foundDoc);
        });
}


/**
 * @param nwsw
 * @returns {*|Promise.<TResult>}
 */
function publicSaveNetworkswitchingPr(nwsw) {
    return db.update({_id: nwsw._id}, nwsw, {}/*options*/)
        .then(function(numReplaced) {
            if (numReplaced) {
                console.log('Documents updated: ', numReplaced);
            }
            return Promise.resolve(numReplaced);
        });
}


/**
 * @param nwsw
 * @returns {*|Promise.<TResult>}
 */
function publicInsertNetworkswitchingPr(nwsw) {
    return db.insert(nwsw)
        .then(function(newDoc) {
            if (newDoc) {
                console.log('Documents inserted: ', newDoc);
            }
            return Promise.resolve(newDoc);
        });
}


/**
 * @param id
 * @returns {*|Promise.<TResult>}
 */
function publicDeleteNetworkswitchingPr(id) {
    return db.remove({ _id: id }, {})
        .then(function(foundDoc){
            console.log("networkswitchingsStore.publicDeleteNetworkswitching", "id", id, "found", foundDoc);
            return foundDoc;
        });
}


/**
 * @param projectId referenced project
 * @returns {Promise.<string>}
 */
function publicDeleteNetworkswitchingsByProjectPr(projectId) {
    return db.remove({ projectId: projectId }, {})
        .then(function(foundDocs){
            console.log("networkswitchingsStore.publicDeleteNetworkswitchingsByProjectPr", "projectId", projectId, "founds", foundDocs);
            return foundDocs;
        });
}


module.exports = {
    getNetworkswitchingsPr : publicGetNetworkswitchingsPr,
    saveNetworkswitchingPr : publicSaveNetworkswitchingPr,
    getNetworkswitchingPr : publicGetNetworkswitchingPr,
    insertNetworkswitchingPr : publicInsertNetworkswitchingPr,
    deleteNetworkswitchingPr : publicDeleteNetworkswitchingPr,
    deleteNetworkswitchingsByProjectPr : publicDeleteNetworkswitchingsByProjectPr
};