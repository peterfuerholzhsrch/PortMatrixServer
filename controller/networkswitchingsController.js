'use strict';


/**
 * The controller module for network switchings.
 */

var store = require('../services/networkswitchingsStore.js');
var projectsStore = require('../services/projectsStore.js');
const winston = require('winston');


// configure log:
var LOG_LABEL = 'networkswitching-controller';
winston.loggers.add(LOG_LABEL, {
    console: {
        label: LOG_LABEL
    }
});
var log = winston.loggers.get(LOG_LABEL);


/**
 * Get network switchings according set request.
 * @param req Following query parameters are supported (Do mind that they must be properly URL-encoded):
 * <ul>
 *     <li>sort=[+-]&lt;colum-name1&gt;[,[+-]&lt;column-name2&gt;]*</li>
 *     <li>offset=&lt;number&gt;</li>
 *     <li>limit=&lt;number&gt;</li>
 *     <li>q=<value> This value is tokenized by white-space. Every token is sought in every column. Since column types
 *          are different search values are converted where possible. Following rules apply:
 *          <ul>
 *              <li>string: looked up if contained in column value; case-insensitive</li>
 *              <li>boolean: if token is 'true' or 'false' (case-insensitive)</li>
 *              <li>number: if Number.parseInt() returned valid value</li>
 *              <li>date: string value must be provided in as returned by new Date().toString() or toUTCString()</li>
 *          </ul>
 *          If the value sought is a string it is sought as substring, other data types must match the whole field. When
 *          the database field is not of type 'string' the string value is tried to convert to the target type.
 *
 *         For further study:
 *         AND: q=&lt;colum-name1&gt;:'<value1>',&lt;colum-name2&gt;:'<value2>' OR:
 *         q=OR(&lt;colum-name1&gt;:'<value1>',&lt;colum-name2&gt;:'<value2>') (further combinations are possible)
 * </ul>
 * These formattings are taken over from <a href="http://blog.mwaysolutions.com/2014/06/05/10-best-practices-for-better-restful-api">here</a>
 *
 * @param res
 */
module.exports.getNetworkswitchings = function (req, res, next) {
    // offset and limit shall be numbers:
    var offset = req.query.offset;
    var limit = req.query.limit;
    // sort must have a form like: sort=-manufacturer,+model
    var sort = req.query.sort;
    var q = req.query.q;

    log.info('getNetworkswitchings q=', q, ', offset=', offset, ', limit=', limit, ', sort-parameters=', sort);

    // handle offset & limit:
    if (offset) {
        offset = Number.parseInt(offset);
        if (isNaN(offset)) {
            throw new Error('offset invalid');
        }
    }
    if (limit) {
        limit = Number.parseInt(limit);
        if (isNaN(limit)) {
            throw new Error('limit invalid');
        }
    }

    // handle sortings:
    var sortings = null;
    if (sort && sort.trim()) {
        sortings = sort.split(',');
        sortings = sortings.filter(token => !!token.trim());

        // '\S' = non-white-space character
        if (!sortings.every(token => token.match(/^[+-]\S+$/))) {
            throw new Error('Sort parameter invalid: ' + sort);
        }
        sortings = sortings.reduce((value, token) => {
            var ascDesc = token[0];
            var column = token.substring(1, token.length);
            value[column] = (ascDesc == '+' ? 1 : -1);
            return value;
        }, {}/*initial value*/);
    }

    var query = { projectId: req.params.projectId };

    // handle query:
    var queryArray = handleQueryString(q);
    if (queryArray) {
        query['$and'] = queryArray;
    }

    projectsStore.checkProjectAccess(req.user.userId, req.params.projectId)
        .then(function() {
            return store.getNetworkswitchingsPr(query, offset, limit, sortings)
        })
        .then(function (docs) {
            log.info('getNetworkswitchingsPr', 'number of docs =', docs ? docs.length : 0);
            res.type('application/json');
            // pack array into data-objects (see https://angular.io/docs/ts/latest/guide/server-communication.html#!#in-mem-web-api)
            res.jsonp({data: docs});
            res.end();
        })
        .catch(function(err) { next(err); });
};


/**
 * @param queryString string containing the tokens to look up (whitespace separated); nwsw has to contain all tokens.
 * @returns {*} list of query objects, null if query is empty
 */
function handleQueryString(queryString) {
    if (!queryString || !queryString.trim()) {
        return null;
    }
    queryString = queryString.trim();
    var queryList = queryString.split(/\s/); // split by white-spaces

    var subqueries = [];
    for (var queryToken of queryList) {
        // searchString contains the value to seek in string-typed columns, searchBoolean for booleans, searchDate for
        // date and searchNumber for integer numbers.
        var searchString = queryToken;
        var searchBoolean = null;
        var searchDate = null;
        var searchInt = null;
        var booleanRegex = new RegExp(/^(true|false)$/gi);

        searchString = new RegExp(queryToken, 'i');
        if (booleanRegex.test(queryToken)) {
            searchBoolean = new Boolean(queryToken.toLowerCase() == 'true');
        }
        // try to convert to number
        var nb = Number.parseInt(queryToken);
        if (!isNaN(nb)) {
            searchInt = nb;
        }
        // try to convert to date (see http://stackoverflow.com/questions/1353684/detecting-an-invalid-date-date-instance-in-javascript):
        var presumableDate = new Date(queryToken);
        if (Object.prototype.toString.call(presumableDate) === '[object Date]') {
            // it is a date
            if (!isNaN(presumableDate.getTime())) {
                searchDate = presumableDate;
            }
        }

        if (searchString) {
            var subquery = {
                ['$or']: [
                    {id: searchString},
                    {state: searchString},
                    {protocol: searchString},
                    {remark: searchString},
                    {['source.group']: searchString},
                    {['source.host']: searchString},
                    {['source.ipAddr']: searchString},
                    {['source.zone']: searchString},
                    {['destination.group']: searchString},
                    {['destination.host']: searchString},
                    {['destination.ipAddr']: searchString},
                    {['destination.zone']: searchString},
                    {['destination.port']: searchString}
                ]
            };
            if (searchBoolean != null) {
                subquery.$or.push({['testresultList.result']: searchBoolean.valueOf()});
            }
            // // search for integral number (Currently we don't need that):
            // if (searchInt) {
            //    subquery.$or.push({ <integer column>: searchInt });
            // }
            if (searchDate) {
                // see http://stackoverflow.com/questions/8835757/return-query-based-on-date
                var dateMidnight = new Date(searchDate);
                dateMidnight.setHours(23);
                dateMidnight.setMinutes(59);
                dateMidnight.setSeconds(59);
                var dateQuery = {['$gt']: searchDate.toISOString(), ['$lt']: dateMidnight.toISOString()};

                subquery.$or = subquery.$or.concat([
                    {creationDate: dateQuery},
                    {lastchangeDate: dateQuery},
                    {['testresultList.timestamp']: dateQuery}
                ]);
            }

            subqueries.push(subquery);
        }
    }
    return subqueries;
}


/**
 * Load one network switching.
 *
 * @param req id is expected in path (see routes)
 * @param res
 * @param next
 */
module.exports.getNetworkswitching = function (req, res, next) {
    log.info('getNetworkswitching', 'req.body', req.body);

    projectsStore.checkProjectAccess(req.user.userId, req.params.projectId)
        .then(function() {
            // 'id' reference to the router pattern: '/api/notes/:id' !
            return store.getNetworkswitchingPr(req.params.id)
        })
        .then(function (doc) {
            log.info('getNetworkswitching', 'doc =', doc);
            res.type('application/json');
            res.jsonp(doc);
            res.end()
        })
        .catch(function(err) { next(err); });
};


/**
 * Save one network switching.
 * @param req
 * @param res
 * @param next
 */
module.exports.saveNetworkswitching = function (req, res, next) {
    log.info('saveNetworkswitching', 'req.body', req.body);

    var projectId = req.params.projectId;
    projectsStore.checkProjectAccess(req.user.userId, projectId)
        .then(function() {
            // set id and reference to project:
            req.body['projectId'] = projectId;
            req.body['_id'] = req.params.id;

            return store.saveNetworkswitchingPr(req.body)
        })
        .then(function (doc) {
            log.info('saveNetworkswitching', 'doc =', doc);
            res.type('application/json');
            res.jsonp(doc);
            res.end();
        })
        .catch(function(err) { next(err); });
};


/**
 * Insert one network switching.
 * @param req
 * @param res
 * @param next
 */
module.exports.insertNetworkswitching = function (req, res, next) {
    log.info('insertNetworkswitching', 'req.body', req.body);

    var projectId = req.params.projectId;
    projectsStore.checkProjectAccess(req.user.userId, projectId)
        .then(function() {
            // _id shall be set by the db-server:
            delete req.body._id;
            // set reference to project:
            req.body['projectId'] = projectId;

            return store.insertNetworkswitchingPr(req.body)
        })
        .then(function (doc) {
            log.info('insertNetworkswitching', 'doc =', doc);
            res.type('application/json');
            res.jsonp(doc);
            res.end();
        })
        .catch(function(err) { next(err); });
};


/**
 * Delete on network switching.
 * @param req id is expected in path (see routes)
 * @param res
 * @param next
 */
module.exports.deleteNetworkswitching = function (req, res, next) {
    projectsStore.checkProjectAccess(req.user.userId, req.params.projectId)
        .then(function() {
            // 'id' reference to the router pattern: '/api/notes/:id' !
            return store.deleteNetworkswitchingPr(req.params.id)
        })
        .then(function (doc) {
            log.info('deleteNetworkswitching', 'doc =', doc);
            res.type('application/json');
            res.jsonp(doc);
            res.end();
        })
        .catch(function(err) { next(err); });
};
