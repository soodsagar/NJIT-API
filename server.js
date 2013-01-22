#!/bin/env node

var express = require('express')
  , http = require('http')
  , path = require('path')
  , format = require('util').format
  , config = require('./config.json')
  , mongodb = require('mongodb')
  , MongoClient = mongodb.MongoClient;

/*
 * Environment setup
 */

var IPADDR = process.env.OPENSHIFT_INTERNAL_IP;
if (typeof IPADDR === 'undefined') {
  console.warn("NO OPENSHIFT_INTERNAL_IP SET. USING 127.0.0.1");
  IPADDR = "127.0.0.1";
}
var PORT   = process.env.OPENSHIFT_INTERNAL_PORT || 8080;

/*
 *
 * MongoDB setup
 *
 */

// by default, connect to local db "njit" without auth
var MongodbConfig = {
    USERNAME: process.env.OPENSHIFT_MONGODB_DB_USERNAME || config.mongo.USERNAME
  , PASSWORD: process.env.OPENSHIFT_MONGODB_DB_PASSWORD || config.mongo.PASSWORD
  , HOST: process.env.OPENSHIFT_MONGODB_DB_HOST || config.mongo.HOST
  , PORT: parseInt(process.env.OPENSHIFT_MONGODB_DB_PORT) || config.mongo.PORT
  , APP_NAME: "njit" || config.mongo.DB
};

/*
 *if (MongodbConfig.USERNAME !== '') {
 *  var MONGO_URI = format(
 *     "mongodb://%s:%s@%s:%s/%s"
 *    , MongodbConfig.USERNAME
 *    , MongodbConfig.PASSWORD
 *    , MongodbConfig.HOST
 *    , MongodbConfig.PORT
 *    , MongodbConfig.APP_NAME
 *  );
 *} else {
 */
var MONGO_URI = format(
    "mongodb://%s:%s/%s"
  , MongodbConfig.HOST
  , MongodbConfig.PORT
  , MongodbConfig.APP_NAME
);
//}
    

/**
 *  terminator === the termination handler
 *  Terminate server on receipt of the specified signal.
 *  @param {string} sig  Signal to terminate on.
 */
function terminator(sig){
  if (typeof sig === "string") {
    console.log('%s: Received %s - terminating sample app ...',
                Date(Date.now()), sig);
                process.exit(1);
  }
  console.log('%s: Node server stopped.', Date(Date.now()) );
};

function setupTerminationHandlers () {

  process.on('exit', function() { terminator(); });

  // NO 'SIGPIPE' bug #852598.
  ['SIGHUP', 'SIGINT', 'SIGQUIT', 
   'SIGILL', 'SIGTRAP', 'SIGABRT',
   'SIGBUS', 'SIGFPE', 'SIGUSR1', 
   'SIGSEGV', 'SIGUSR2', 'SIGTERM'
  ].forEach(function(element, index, array) {
    process.on(element, function() { terminator(element); });
  });
};

function server_start(db) {
  console.log("Starting server");
  var app = express();

  app.configure(function(){
    app.set('port', PORT);
    app.set('ip', IPADDR);
    app.use(express.favicon());
    app.use(express.logger('dev'));
    app.use(express.bodyParser());
    app.use(express.methodOverride());
    app.use(app.router);
    app.use(express.static(path.join(__dirname, 'public')));
  });

  app.configure('development', function(){
    app.use(express.errorHandler());
  });

  http.createServer(app).listen(app.get('port'), app.get('ip'), function(){
    console.log("Express server listening on port " + app.get('port'));
  });

  // setup routes
  require('./routes')(app, db);
}

setupTerminationHandlers();

console.log("Connecting mongo to: " + MONGO_URI);
MongoClient.connect(MONGO_URI, function(err, db) {
  if(err) throw err;
  console.log("Mongo connected");
  server_start(db);
});


