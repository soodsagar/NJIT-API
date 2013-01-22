#!/bin/env node

var express = require('express')
  , http = require('http')
  , path = require('path');


var IPADDR = process.env.OPENSHIFT_INTERNAL_IP | "127.0.0.1";
var PORT   = process.env.OPENSHIFT_INTERNAL_PORT || 8080;

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

setupTerminationHandlers();

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
require('./routes')(app);
