/* jshint node: true, browser: false */
'use strict';

require("console-stamp")(console, "HH:MM:ss.l");

// LOG UNHANDLED EXCEPTION AND EXIT
process.on('uncaughtException', function (err) {
  console.error('uncaughtException:', err.message);
  console.error(err.stack);
});

/////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////

// CREATE HTTP SERVER AND PROXY

var app     = require('express')();
var proxy   = require('http-proxy').createProxyServer({});

// LOAD CONFIGURATION

app.use(require('morgan')('dev'));
app.use(require('compression')());

app.use('/app',         require('serve-static')(__dirname + '/app_build'));
app.use('/app',         require('serve-static')(__dirname + '/app'));
app.all('/app/*',       function(req, res) { res.status(404).send(); } );

// Configure routes

app.get   ('/api/*', function(req, res) { proxy.web(req, res, { target: 'https://api.cbd.int:443', secure: false } ); } );
app.put   ('/api/*', function(req, res) { proxy.web(req, res, { target: 'https://api.cbd.int:443', secure: false } ); } );
app.post  ('/api/*', function(req, res) { proxy.web(req, res, { target: 'https://api.cbd.int:443', secure: false } ); } );
app.delete('/api/*', function(req, res) { proxy.web(req, res, { target: 'https://api.cbd.int:443', secure: false } ); } );

// FOR DEV:
// app.all('/*', function(req, res) { proxy.web(req, res, { target: 'https://bch.cbd.int:443', secure: false } ); } );

// Start server

app.listen(process.env.PORT || 2050, function () {
	console.log('Server listening on %j', this.address());
});

// LOG PROXY ERROR & RETURN http:500

proxy.on('error', function (e, req, res) {
    console.error('error proxying: '+req.url);
    console.error('proxy error:', e);
    res.send( { code: 500, source:'chm/proxy', message : 'proxy error', proxyError: e }, 500);
});
