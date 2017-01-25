"use strict";
/**
 * Created by pfu on 26/10/16.
 *
 * Express server main functions.
 */

var express = require('express');
var bodyParser = require('body-parser');
var jwt = require('express-jwt');


// build up middleware:

var app = express();

function notFound(req, res, next) {
    res.setHeader("Content-Type", 'text/html');
    res.status(404).end("Confound it all!  We could not find ye's page! ");
}

function errorHandler(err, req, res, next) {
    console.log("Error Handler: err=", err);
    res.status(500).end(err.message);
}


function myDummyLogger(req, res, next) {
    console.log(req.method + ":" + req.url);
    next();
}

// TODO OK???
function onError(error) {
    if (error.syscall !== 'listen') {
        throw error;
    }

    var bind = typeof port === 'string'
        ? 'Pipe ' + port
        : 'Port ' + port;

    // handle specific listen errors with friendly messages
    switch (error.code) {
        case 'EACCES':
            console.error(bind + ' requires elevated privileges');
            process.exit(1);
            break;
        case 'EADDRINUSE':
            console.error(bind + ' is already in use');
            process.exit(1);
            break;
        default:
            throw error;
    }
}


//TODO needed / ok???
var jwtSecret = 'jflkjfsadklöfad lfdas öijöeriteiöjleak ipa398289uo';
var issuer = "Marco Endres / Peter Fuerholz";
app.set("jwt-secret", jwtSecret); //secret should be in a config file - or better be a private key!
app.set("jwt-sign", {expiresIn: "1d", audience :"self", issuer : issuer});
app.set("jwt-validate", {secret: jwtSecret, audience :"self", issuer : issuer});



//app.on('error', onError);

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
app.use(express.static(__dirname + '/public'));
app.use(require('./routes/usersNoAuthRoutes.js'));

// TODO For test only:
app.use("/api/nwsw", require('./routes/networkswitchingsRoutes.js'));

app.use(jwt(app.get("jwt-validate"))); // after this middleware a token is required!
app.use(require('./routes/usersAuthRoutes.js'));
app.use("/api/projects", require('./routes/projectsRoutes.js'));
// TODO app.use("/api/nwsw", require('./routes/networkswitchingsRoutes.js'));

app.use(notFound);
app.use(errorHandler);

//router.all("/*", myDummyLogger());

const hostname = '127.0.0.1';
const port = 3001;
app.listen(port, hostname, function () {
    console.log('Server running at http://' + hostname + ':' + port);
});
