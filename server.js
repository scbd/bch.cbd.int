'use strict';
/* jshint node:true */
var fs = require('fs');
var http = require('http');
var express = require('express');

// Create server

var app = express();
var server = http.createServer(app);
var oneDay = 24*60*60*1000;

app.configure(function() {
    app.set('port', process.env.PORT || 2050, '127.0.0.1');
    app.use(express.logger('dev'));
    app.use(express.compress());
    app.use('/app', express.static(__dirname + '/app'));
});

// Configure routes

app.get('*', function(req, res) { res.send('404', 404); } );

// Start server

console.log('Server listening on port ' + app.get('port'));
server.listen(app.get('port'));