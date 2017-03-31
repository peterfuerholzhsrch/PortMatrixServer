'use strict';

/**
 * Express server main module.
 */

var express = require('express');
var bodyParser = require('body-parser');
var jwt = require('express-jwt');
var config = require('./config');
const winston = require('winston');
var fs = require('fs');


var LOG_LABEL = 'server-main';
winston.loggers.add(LOG_LABEL, {
    console: {
        label: LOG_LABEL
    }
});
var log = winston.loggers.get(LOG_LABEL);


// build up middleware:

var app = express();
module.exports = app;

function notFound(req, res, next) {
    res.setHeader('Content-Type', 'text/html');
    res.status(404).end('Confound it all!  We could not find ye\'s page! ');
}

function notFoundJson(req, res, next) {
    res.setHeader('Content-Type', 'application/json');
    res.status(404).end();
}

function errorHandler(err, req, res, next) {
    log.error('Error Handler: err=', err);
    res.status(500).end(err.message);
}

function logger(req, res, next) {
    log.info(req.method + ':' + req.url);
    next();
}

// pass environment variable to app setting:
app.set('smtpConfig', process.env.PORTMATRIX_SMTP_CONFIG);

// setup JWT:
app.set('jwt-secret', config.jwtSecret);
app.set('jwt-sign', {expiresIn: '1d', audience :'self', issuer : config.jwtIssuer});
app.set('jwt-validate', {secret: config.jwtSecret, audience :'self', issuer : config.jwtIssuer});

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.use(require('method-override')(function (req, res) {
    if (req.body && typeof req.body === 'object' && '_method' in req.body) {
        var method = req.body._method;
        delete req.body._method;
        return method;
    }
}));
app.use(logger);

// apiRouter contains all routes to '/api' -> REST calls
var apiRouter = express.Router();
apiRouter.use(require('./routes/usersNoAuthRoutes.js'));

// after this middleware a token is required!
apiRouter.use(jwt(app.get('jwt-validate')));

apiRouter.use(require('./routes/usersAuthRoutes.js'));
apiRouter.use('/projects', require('./routes/projectsRoutes.js'));
apiRouter.use('/nwsws', require('./routes/networkswitchingsRoutes.js'));
apiRouter.use(notFoundJson);
apiRouter.use(errorHandler);

app.use('/api', apiRouter);

// all other calls shall be handled as static (non-REST) calls:
app.use(express.static(__dirname + '/public'));

app.use(function(req, res, next) {
    // just provide index.html (without changing the URL -> URL incl. query will be preserved!):
    // see http://stackoverflow.com/questions/7268033/basic-static-file-server-in-nodejs
    res.writeHead(200, {'Content-Type': 'text/html'});
    var fileStream = fs.createReadStream(__dirname + '/public/index.html');
    fileStream.pipe(res);
});

app.use(notFound);
app.use(errorHandler);


const hostname = process.env.HOSTNAME || '127.0.0.1';
const port = Number.parseInt(process.env.PORT) || 3001;
app.listen(port, hostname, function () {
    console.log('Server running at http://' + hostname + ':' + port);
});
