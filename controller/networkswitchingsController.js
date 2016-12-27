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
 *     <li>sort=[+-]&lt;colum-name&gt;[,[+-]&lt;column-name&gt;]*</li>
 *     <li>offset=&lt;number&gt;</li>
 *     <li>limit=&lt;number&gt;</li>
 *     <li>filter=&lt;colum-name&gt;= TODO To be implemented</li>
 * </ul>
 * These formattings are taken over from <a href="http://blog.mwaysolutions.com/2014/06/05/10-best-practices-for-better-restful-api">here</a>
 *
 * @param res
 */
module.exports.getNetworkswitchings = function(req, res)
{
    // offset and limit shall be numbers:
    var offset = req.query.offset;
    var limit = req.query.limit;
    // sort must have a form like: sort=-manufactorer,+model
    var sort = req.query.sort;

    console.log("offset=" + offset + ", limit=" + limit + ", sort-parameters=" + sort);

    if (offset) {
        offset = Number.parseInt(offset)
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

    store.getNetworkswitchings(offset, limit, sortings, function(err, docs, next) {
        if (err) {
            next(err);
            return;
        }
        console.log('ctr.getNetworkswitchings', 'number of docs =', docs ? docs.length : 0);
        res.type('application/json');
        // pack array into data-objects (see https://angular.io/docs/ts/latest/guide/server-communication.html#!#in-mem-web-api)
        res.jsonp({data : docs});
        res.end();
    });
};


/**
 * @param req id is expected in path (see routes)
 * @param res
 * @param next
 */
module.exports.getNetworkswitching = function(req, res, next)
{
    // 'id' reference to the router pattern: '/api/notes/:id' !
    store.getNetworkswitching(req.params.id,
        function(err, doc) {
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


module.exports.saveNetworkswitching = function(req, res, next)
{
    console.log("networkswitchingsController", "req.body", req.body);

    store.saveNetworkswitching(req.body,
        function(err, doc) {
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


module.exports.insertNetworkswitching = function(req, res, next)
{
    console.log("networkswitchingsController", "req.body", req.body);

    store.insertNetworkswitching(req.body,
        function(err, doc) {
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
module.exports.deleteNetworkswitching = function(req, res, next)
{
    // 'id' reference to the router pattern: '/api/notes/:id' !
    store.deleteNetworkswitching(req.params.id,
        function(err, doc) {
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
