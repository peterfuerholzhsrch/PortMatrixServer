"use strict";
/**
 * Created by pfu on 26/10/16.
 *
 * Express server main functions.
 */

var express = require('express');
var bodyParser = require('body-parser');
var jwt = require('express-jwt');
var config = require('./config');
const winston = require('winston');


// TODO Enable for production!!!
// Log.setProductionMode();


var LOG_LABEL = 'server-main';
winston.loggers.add(LOG_LABEL, {
    console: {
        label: LOG_LABEL
    }
});
var log = winston.loggers.get(LOG_LABEL);


// build up middleware:

var app = express();

function notFound(req, res, next) {
    res.setHeader("Content-Type", 'text/html');
    res.status(404).end("Confound it all!  We could not find ye's page! ");
}

function errorHandler(err, req, res, next) {
    log.error("Error Handler: err=", err);
    res.status(500).end(err.message);
}

function logger(req, res, next) {
    log.info(req.method + ":" + req.url);
    next();
}


// setup JWT:
app.set("jwt-secret", config.jwtSecret);
app.set("jwt-sign", {expiresIn: "1d", audience :"self", issuer : config.jwtIssuer});
app.set("jwt-validate", {secret: config.jwtSecret, audience :"self", issuer : config.jwtIssuer});



app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.use(require("method-override")(function (req, res) {
    if (req.body && typeof req.body === 'object' && '_method' in req.body) {
        var method = req.body._method;
        delete req.body._method;
        return method;
    }
}));
app.use(logger);
app.use(express.static(__dirname + '/public'));
app.use(require('./routes/usersNoAuthRoutes.js'));

// after this middleware a token is required!
app.use(jwt(app.get("jwt-validate")));

app.use(require('./routes/usersAuthRoutes.js'));
app.use("/api/projects", require('./routes/projectsRoutes.js'));
app.use("/api/nwsws", require('./routes/networkswitchingsRoutes.js'));

app.use(notFound);
app.use(errorHandler);


const hostname = '127.0.0.1';
const port = 3001;
app.listen(port, hostname, function () {
    console.log('Server running at http://' + hostname + ':' + port);
});
