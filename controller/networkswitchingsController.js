"use strict";
/**
 * Created by pfu on 26/10/16.
 *
 * The controller module.
 */

var store = require("../services/networkswitchingsStore.js");


/**
 * Get network switchings according set request.
 * @param req Following query parameters are supported (Do mind that they must be properly URL-encoded):
 * <ul>
 *     <li>sort=[+-]&lt;colum-name1&gt;[,[+-]&lt;column-name2&gt;]*</li>
 *     <li>offset=&lt;number&gt;</li>
 *     <li>limit=&lt;number&gt;</li>
 *     <li>q=<value> This value is sought in every column. The data typing occurs under following rules:
 *          <ul>
 *              <li>string: enclose by '' or ""</li>
 *              <li>boolean: true / false</li>
 *              <li>number: no enclosing, just as decimal values (divider?)</li>
 *              <li>date: in format provided by new Date().toString() or toUTCString()</li>
 *          </ul>
 *          If the value sought is a string it is sought as substring, other data types must match the whole field. When
 *          the database field is not of type 'string' the string value is tried to convert to the target type.
 *
 *
 *         TODO For further study:
 *         AND: q=&lt;colum-name1&gt;:'<value1>',&lt;colum-name2&gt;:'<value2>' OR:
 *         q=OR(&lt;colum-name1&gt;:'<value1>',&lt;colum-name2&gt;:'<value2>') (further combinations are possible)
 * </ul>
 * These formattings are taken over from <a href="http://blog.mwaysolutions.com/2014/06/05/10-best-practices-for-better-restful-api">here</a>
 *
 * @param res
 */
module.exports.getNetworkswitchings = function (req, res) {
    // offset and limit shall be numbers:
    var offset = req.query.offset;
    var limit = req.query.limit;
    // sort must have a form like: sort=-manufactorer,+model
    var sort = req.query.sort;
    var q = req.query.q;

    console.log("q=" + q + ", offset=" + offset + ", limit=" + limit + ", sort-parameters=" + sort);

    // handle offset & limit:
    if (offset) {
        offset = Number.parseInt(offset);
        if (isNaN(offset)) {
            throw new Error("offset invalid");
        }
    }
    if (limit) {
        limit = Number.parseInt(limit);
        if (isNaN(limit)) {
            throw new Error("limit invalid");
        }
    }

    // handle sortings:
    var sortings = null;
    if (sort && sort.trim()) {
        sortings = sort.split(",");
        sortings = sortings.filter(token => !!token.trim());

        // '\S' = non-white-space character
        if (!sortings.every(token => token.match(/^[+-]\S+$/))) {
            throw new Error("Sort parameter invalid: " + sort);
        }
        sortings = sortings.reduce((value, token) => {
            var ascDesc = token[0];
            var column = token.substring(1, token.length);
            value[column] = (ascDesc == '+' ? 1 : -1);
            return value;
        }, {}/*initial value*/);
    }

    // handle query:
    if (q && q.trim()) {
        q = q.trim();

        // searchString contains the value to seek in string-typed columns, searchBoolean for booleans, searchDate for
        // date and searchNumber for integer numbers.
        var searchString = q;
        var searchBoolean = null;
        var searchDate = null;
        var searchInt = null;

        var strRegex = new RegExp(/^['"].*['"]$/g);
        var booleanRegex = new RegExp(/^(true|false)$/gi);
        if (strRegex.test(q)) {
            // remove ''/"":
            q = q.slice(1, q.length-1);
            // enclosed by '' or ""n -> string; made Regex of (-> /q/) -> implements 'contains' behaviour
            searchString = new RegExp(q);
        }
        if (booleanRegex.test(q)) {
            searchBoolean = q.toLowerCase() == 'true';
        }
        // try to convert to number
        var nb = Number.parseInt(q);
        if (!isNaN(nb)) {
            searchInt = nb;
        }
        // try to convert to date (see http://stackoverflow.com/questions/1353684/detecting-an-invalid-date-date-instance-in-javascript):
        var presumableDate = new Date(q);
        if (Object.prototype.toString.call(presumableDate) === "[object Date]" ) {
            // it is a date
            if (!isNaN(presumableDate.getTime())) {
                searchDate = presumableDate;
            }
        }

        var query = { $or: [
            { state: searchString },
            { protocol: searchString },
            { remark: searchString },
            { test_state: searchString },  // TODO does not yet exist
            { ['source.group']: searchString },
            { ['source.host']: searchString },
            { ['source.ipAddr']: searchString },
            { ['source.zone']: searchString },
            { ['destination.group']: searchString },
            { ['destination.host']: searchString },
            { ['destination.ipAddr']: searchString },
            { ['destination.zone']: searchString },
            { ['destination.port']: searchString }
        ]};
        if (searchInt) {
            query.$or.push({ id: searchInt });
        }
        // TODO search for creation date, last test date
    }

    store.getNetworkswitchings(query, offset, limit, sortings, function (err, docs, next) {
        if (err) {
            next(err);
            return;
        }
        console.log('ctr.getNetworkswitchings', 'number of docs =', docs ? docs.length : 0);
        res.type('application/json');
        // pack array into data-objects (see https://angular.io/docs/ts/latest/guide/server-communication.html#!#in-mem-web-api)
        res.jsonp({data: docs});
        res.end();
    });
};


/**
 * @param req id is expected in path (see routes)
 * @param res
 * @param next
 */
module.exports.getNetworkswitching = function (req, res, next) {
    // 'id' reference to the router pattern: '/api/notes/:id' !
    store.getNetworkswitching(req.params.id,
        function (err, doc) {
            if (err) {
                next(err);
                return;
            }
            console.log('ctr.getNetworkswitching', 'doc =', doc);
            res.type('application/json');
            res.jsonp(doc);
            res.end();
        });
};


module.exports.saveNetworkswitching = function (req, res, next) {
    console.log("networkswitchingsController", "req.body", req.body);

    store.saveNetworkswitching(req.body,
        function (err, doc) {
            if (err) {
                next(err);
                return;
            }
            console.log('ctr.saveNetworkswitching', 'doc =', doc);
            res.type('application/json');
            res.jsonp(doc);
            res.end();
        });
};


module.exports.insertNetworkswitching = function (req, res, next) {
    console.log("networkswitchingsController", "req.body", req.body);

    store.insertNetworkswitching(req.body,
        function (err, doc) {
            if (err) {
                next(err);
                return;
            }
            if (doc) {
                console.log('ctr.insertNetworkswitching', 'doc =', doc);
                res.type('application/json');
                res.jsonp(doc);
                res.end();
            }
        });
};


/**
 * @param req id is expected in path (see routes)
 * @param res
 * @param next
 */
module.exports.deleteNetworkswitching = function (req, res, next) {
    // 'id' reference to the router pattern: '/api/notes/:id' !
    store.deleteNetworkswitching(req.params.id,
        function (err, doc) {
            if (err) {
                next(err);
                return;
            }
            console.log('ctr.deleteNetworkswitching', 'doc =', doc);
            res.type('application/json');
            res.jsonp(doc);
            res.end();
        });
};
