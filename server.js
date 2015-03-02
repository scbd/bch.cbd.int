'use strict';
/* jshint node:true */

require('console-stamp')(console, 'HH:MM:ss.l');

// LOG UNHANDLED EXCEPTION AND EXIT
process.on('uncaughtException', function (err) {
  console.error('uncaughtException:', err.message);
  console.error(err.stack);
  process.exit(1);
});

/////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////
var express = require('express');
var app     = express();
var server  = require('http').createServer(app);

app.set('port', process.env.PORT || 2050);
app.use(express.logger('dev'));
app.use(express.compress());

// Configure routes

app.use('/app', express.static(__dirname + '/app'));

var apiProxy = require('http-proxy').createProxyServer({}); app.all('/api', function(req, res) { apiProxy.web(req, res, {target : 'https://api.cbd.int:443'}); } );
//var bchProxy = require('http-proxy').createProxyServer({}); app.all('*',    function(req, res) { bchProxy.web(req, res, {target : 'http://172.16.228.187:80'}); } );

app.all('*', function(req, res) { res.send('404', 404); } );

// Start server

server.listen(app.get('port'), '0.0.0.0');
server.on('listening', function () {
    console.info('info: BCH started. Listening on %j', this.address());
});
