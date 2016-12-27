"use strict";
/**
 * Created by pfu on 26/10/16.
 *
 * Express server main functions.
 */

var express = require('express');
var bodyParser = require('body-parser');

// build up middleware:

var app = express();

function notFound(req, res, next) {
    res.setHeader("Content-Type", 'text/html');
    res.send(404, "Confound it all!  We could not find ye's page! ")
}

function errorHandler(err, req, res, next) {
    console.log("Error Handler: err=", err);
    res.status(500).end(err.message);
}


function myDummyLogger(req, res, next) {
    console.log(req.method + ":" + req.url);
    next();
}

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.use(require("method-override")(function (req, res) {
    if (req.body && typeof req.body === 'object' && '_method' in req.body) {
        var method = req.body._method;
        delete req.body._method;
        return method;
    }
}));
app.use(myDummyLogger);
app.use(require('./routes/networkswitchingsRoutes.js'));
app.use(express.static(__dirname + '/public'));
app.use(notFound);
app.use(errorHandler);

//router.all("/*", myDummyLogger());

const hostname = '127.0.0.1';
const port = 3001;
app.listen(port, hostname, function () {
    console.log('Server running at http://' + hostname + ':' + port);
});
