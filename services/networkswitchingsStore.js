"use strict";

var Promise = require('promise');


/**
 * Created by pfu on 26/10/16.
 *
 * The network switching store (= persistence layer).
 */

var Datastore = require('nedb');
var db = new Datastore({ filename: './data/networkswitchings.db', autoload: true });

// set index on 'id' to make it unique, but allow null value (!)
db.ensureIndex({ fieldName: "id", unique: true, sparse: true }, function(error) { if (error) { throw error; } });



/**
 * set true to create some initial entries (applies only when notes collection is empty)
 * @type {boolean}
 */
var FILL_INITIAL_ENTRIES = false; // TODO   false;

var MAX_RECORDS_LIMIT = 1000;


//
// methods for saving / loading network switchings:
//

function fillInitialEntries() {
    console.log("networkswitchingsStore: Create some dummy entries...");

    //
    // fill with default/test data:
    //
    let nwsws = [
        {
            id: 11, state: 'Pending',
            source: {group: 'SZP', host: 'swawz', ipAddr: '10.100.127.18', zone: 'braun'},
            destination: {group: 'SZD', host: 'bwawa', ipAddr: '20.030.168.17', zone: 'rot', port: '122-133'}
        },
        {
            id: 12, state: 'Implemented',
            source: {group: 'SZP', host: 'swbwz', ipAddr: '10.100.128.18', zone: 'rot'},
            destination: {group: 'SZD', host: 'swbwz', ipAddr: '20.030.168.17', zone: 'gelb', port: '16000'}
        },
        {
            id: 13, state: 'Implemented',
            source: {group: 'SZP', host: 'swawz', ipAddr: '10.100.127.18', zone: 'orange'},
            destination: {group: 'SZD', host: 'bwawa', ipAddr: '20.030.168.17', zone: 'rot', port: '8080'}
        },
        {
            id: 14, state: 'Deleted',
            source: {group: 'SZP', host: 'swawz', ipAddr: '10.100.127.18', zone: 'orange'},
            destination: {group: 'SZD', host: 'bwawa', ipAddr: '20.030.168.17', zone: 'gelb', port: '8080, 8088'}
        },
        {
            id: 15, state: 'Pending',
            source: {group: 'SZP', host: 'swawz', ipAddr: '10.100.127.18', zone: 'braun'},
            destination: {group: 'SZD', host: 'bwawa', ipAddr: '20.030.168.17', zone: 'rot', port: '10'}
        },

        {
            id: 16, state: 'Pending',
            source: {group: 'SZP', host: 'swawz', ipAddr: '10.100.127.18', zone: 'braun'},
            destination: {group: 'SZD', host: 'bwawa', ipAddr: '20.030.168.17', zone: 'rot', port: '122-133'}
        },
        {
            id: 17, state: 'Implemented',
            source: {group: 'SZP', host: 'swbwz', ipAddr: '10.100.128.18', zone: 'rot'},
            destination: {group: 'SZD', host: 'swbwz', ipAddr: '20.030.168.17', zone: 'gelb', port: '16000'}
        },
        {
            id: 18, state: 'Implemented',
            source: {group: 'SZP', host: 'swawz', ipAddr: '10.100.127.18', zone: 'orange'},
            destination: {group: 'SZD', host: 'bwawa', ipAddr: '20.030.168.17', zone: 'rot', port: '8080'}
        },
        {
            id: 19, state: 'Deleted',
            source: {group: 'SZP', host: 'swawz', ipAddr: '10.100.127.18', zone: 'orange'},
            destination: {group: 'SZD', host: 'bwawa', ipAddr: '20.030.168.17', zone: 'gelb', port: '8080, 8088'}
        },
        {
            id: 20, state: 'Pending',
            source: {group: 'SZP', host: 'swawz', ipAddr: '10.100.127.18', zone: 'braun'},
            destination: {group: 'SZD', host: 'bwawa', ipAddr: '20.030.168.17', zone: 'rot', port: '10'}
        },

        {
            id: 21, state: 'Pending',
            source: {group: 'SZP', host: 'swawz', ipAddr: '10.100.127.18', zone: 'braun'},
            destination: {group: 'SZD', host: 'bwawa', ipAddr: '20.030.168.17', zone: 'rot', port: '122-133'}
        },
        {
            id: 22, state: 'Implemented',
            source: {group: 'SZP', host: 'swbwz', ipAddr: '10.100.128.18', zone: 'rot'},
            destination: {group: 'SZD', host: 'swbwz', ipAddr: '20.030.168.17', zone: 'gelb', port: '16000'}
        },
        {
            id: 23, state: 'Implemented',
            source: {group: 'SZP', host: 'swawz', ipAddr: '10.100.127.18', zone: 'orange'},
            destination: {group: 'SZD', host: 'bwawa', ipAddr: '20.030.168.17', zone: 'rot', port: '8080'}
        },
        {
            id: 24, state: 'Deleted',
            source: {group: 'SZP', host: 'swawz', ipAddr: '10.100.127.18', zone: 'orange'},
            destination: {group: 'SZD', host: 'bwawa', ipAddr: '20.030.168.17', zone: 'gelb', port: '8080, 8088'}
        },
        {
            id: 25, state: 'Pending',
            source: {group: 'SZP', host: 'swawz', ipAddr: '10.100.127.18', zone: 'braun'},
            destination: {group: 'SZD', host: 'bwawa', ipAddr: '20.030.168.17', zone: 'rot', port: '10'}
        },

        {
            id: 26, state: 'Pending',
            source: {group: 'SZP', host: 'swawz', ipAddr: '10.100.127.18', zone: 'braun'},
            destination: {group: 'SZD', host: 'bwawa', ipAddr: '20.030.168.17', zone: 'rot', port: '122-133'}
        },
        {
            id: 27, state: 'Implemented',
            source: {group: 'SZP', host: 'swbwz', ipAddr: '10.100.128.18', zone: 'rot'},
            destination: {group: 'SZD', host: 'swbwz', ipAddr: '20.030.168.17', zone: 'gelb', port: '16000'}
        },
        {
            id: 28, state: 'Implemented',
            source: {group: 'SZP', host: 'swawz', ipAddr: '10.100.127.18', zone: 'orange'},
            destination: {group: 'SZD', host: 'bwawa', ipAddr: '20.030.168.17', zone: 'rot', port: '8080'}
        },
        {
            id: 29, state: 'Deleted',
            source: {group: 'SZP', host: 'swawz', ipAddr: '10.100.127.18', zone: 'orange'},
            destination: {group: 'SZD', host: 'bwawa', ipAddr: '20.030.168.17', zone: 'gelb', port: '8080, 8088'}
        },
        {
            id: 30, state: 'Pending',
            source: {group: 'SZP', host: 'swawz', ipAddr: '10.100.127.18', zone: 'braun'},
            destination: {group: 'SZD', host: 'bwawa', ipAddr: '20.030.168.17', zone: 'rot', port: '10'}
        },

        {
            id: 31, state: 'Pending',
            source: {group: 'SZP', host: 'swawz', ipAddr: '10.100.127.18', zone: 'braun'},
            destination: {group: 'SZD', host: 'bwawa', ipAddr: '20.030.168.17', zone: 'rot', port: '122-133'}
        },
        {
            id: 32, state: 'Implemented',
            source: {group: 'SZP', host: 'swbwz', ipAddr: '10.100.128.18', zone: 'rot'},
            destination: {group: 'SZD', host: 'swbwz', ipAddr: '20.030.168.17', zone: 'gelb', port: '16000'}
        },
        {
            id: 33, state: 'Implemented',
            source: {group: 'SZP', host: 'swawz', ipAddr: '10.100.127.18', zone: 'orange'},
            destination: {group: 'SZD', host: 'bwawa', ipAddr: '20.030.168.17', zone: 'rot', port: '8080'}
        },
        {
            id: 34, state: 'Deleted',
            source: {group: 'SZP', host: 'swawz', ipAddr: '10.100.127.18', zone: 'orange'},
            destination: {group: 'SZD', host: 'bwawa', ipAddr: '20.030.168.17', zone: 'gelb', port: '8080, 8088'}
        },
        {
            id: 35, state: 'Pending',
            source: {group: 'SZP', host: 'swawz', ipAddr: '10.100.127.18', zone: 'braun'},
            destination: {group: 'SZD', host: 'bwawa', ipAddr: '20.030.168.17', zone: 'rot', port: '10'}
        },

        {
            id: 36, state: 'Pending',
            source: {group: 'SZP', host: 'swawz', ipAddr: '10.100.127.18', zone: 'braun'},
            destination: {group: 'SZD', host: 'bwawa', ipAddr: '20.030.168.17', zone: 'rot', port: '122-133'}
        },
        {
            id: 37, state: 'Implemented',
            source: {group: 'SZP', host: 'swbwz', ipAddr: '10.100.128.18', zone: 'rot'},
            destination: {group: 'SZD', host: 'swbwz', ipAddr: '20.030.168.17', zone: 'gelb', port: '16000'}
        },
        {
            id: 38, state: 'Implemented',
            source: {group: 'SZP', host: 'swawz', ipAddr: '10.100.127.18', zone: 'orange'},
            destination: {group: 'SZD', host: 'bwawa', ipAddr: '20.030.168.17', zone: 'rot', port: '8080'}
        },
        {
            id: 39, state: 'Deleted',
            source: {group: 'SZP', host: 'swawz', ipAddr: '10.100.127.18', zone: 'orange'},
            destination: {group: 'SZD', host: 'bwawa', ipAddr: '20.030.168.17', zone: 'gelb', port: '8080, 8088'}
        },
        {
            id: 40, state: 'Pending',
            source: {group: 'SZP', host: 'swawz', ipAddr: '10.100.127.18', zone: 'braun'},
            destination: {group: 'SZD', host: 'bwawa', ipAddr: '20.030.168.17', zone: 'rot', port: '10'}
        },

        {
            id: 41, state: 'Pending',
            source: {group: 'SZP', host: 'swawz', ipAddr: '10.100.127.18', zone: 'braun'},
            destination: {group: 'SZD', host: 'bwawa', ipAddr: '20.030.168.17', zone: 'rot', port: '122-133'}
        },
        {
            id: 42, state: 'Implemented',
            source: {group: 'SZP', host: 'swbwz', ipAddr: '10.100.128.18', zone: 'rot'},
            destination: {group: 'SZD', host: 'swbwz', ipAddr: '20.030.168.17', zone: 'gelb', port: '16000'}
        },
        {
            id: 43, state: 'Implemented',
            source: {group: 'SZP', host: 'swawz', ipAddr: '10.100.127.18', zone: 'orange'},
            destination: {group: 'SZD', host: 'bwawa', ipAddr: '20.030.168.17', zone: 'rot', port: '8080'}
        },
        {
            id: 44, state: 'Deleted',
            source: {group: 'SZP', host: 'swawz', ipAddr: '10.100.127.18', zone: 'orange'},
            destination: {group: 'SZD', host: 'bwawa', ipAddr: '20.030.168.17', zone: 'gelb', port: '8080, 8088'}
        },
        {
            id: 45, state: 'Pending',
            source: {group: 'SZP', host: 'swawz', ipAddr: '10.100.127.18', zone: 'braun'},
            destination: {group: 'SZD', host: 'bwawa', ipAddr: '20.030.168.17', zone: 'rot', port: '10'}
        }

    ];

    db.insert(nwsws, function(err, newDoc) {
        if (err) {
            console.log("error", err);
        }
        if (newDoc) {
            console.log('Documents inserted: ', newDoc);
        }
    });
}

/**
 * @param query query object
 * @param offset How many records shall be skipped (0=no skipping)
 * @param limit How many records shall be returned at max (is limited to MAX_RECORDS_LIMIT when not provided)
 * @param sorting sorting object
 * @param callback
 * @return Array Returns persistent notes.
 */
function publicGetNetworkswitchings(query, offset, limit, sorting, callback) {

    if (!sorting) {
        sorting = { "id": 1}; // sort by id ascending
    }

    console.log("networkswitchingsStore, sorting=" + JSON.stringify(sorting) + ", offset=" + offset + ", limit=" + limit);

    db.find(query)
        .sort(sorting)
        .skip(offset || 0)
        .limit(limit || MAX_RECORDS_LIMIT)
        .exec(function (err, docs) {
            // console.log("find() called, err=", err, " docs=", docs);

            if (FILL_INITIAL_ENTRIES) {
                try {
                    if (offset === 0 && (!docs || docs.length === 0)) {
                        fillInitialEntries();
                        publicGetNetworkswitchings(callback); // single recursion
                        callback = null; // avoid sending response twice!
                    }
                }
                catch (exception) {
                    console.log(exception);
                    err = exception;
                }
            }

            if (callback) {
                callback(err, docs);
            }
        });
}


function publicGetNetworkswitching(id, callback)
{
    db.findOne({ _id: id }, function(err, foundDoc){
        console.log("networkswitchingsStore.publicGetNetworkswitching", "id", id, "found", foundDoc);
        if (callback){
            callback(err, foundDoc);
        }
    });
}


function publicSaveNetworkswitching(nwsw, callback) {
    if (nwsw._id) {
        db.update({_id: nwsw._id}, nwsw, {}/*options*/, function(err, numReplaced) {
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
        db.insert(nwsw, function(err, newDoc) {
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


function publicInsertNetworkswitching(nwsw, callback) {
    db.insert(nwsw, function(err, newDoc) {
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


function publicDeleteNetworkswitching(id, callback) {
    db.remove({ _id: id }, {}, function(err, foundDoc){
        console.log("networkswitchingsStore.publicDeleteNetworkswitching", "id", id, "found", foundDoc);
        if (callback){
            callback(err, foundDoc);
        }
    })
}


function publicDeleteNetworkswitchingsByProjectPr(projectId) {
    // TODO
    return Promise.resolve("nothing");
}


module.exports = {
    getNetworkswitchings : publicGetNetworkswitchings,
    saveNetworkswitching : publicSaveNetworkswitching,
    getNetworkswitching : publicGetNetworkswitching,
    insertNetworkswitching : publicInsertNetworkswitching,
    deleteNetworkswitching : publicDeleteNetworkswitching,
    deleteNetworkswitchingsByProjectPr : publicDeleteNetworkswitchingsByProjectPr
};