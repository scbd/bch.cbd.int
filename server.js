'use strict'; // jshint browser: false, node: true, esnext: true
// CREATE HTTP SERVER AND PROXY
var proxy   = require('http-proxy').createProxyServer({});
var express = require('express');
var app     = new express();

app.use(require('morgan')('dev'));

// Configure routes

app.use('/app',   express.static(__dirname + '/app'));
app.all('/app/*', (req, res) => res.status(404).send());
app.all('/api/*', (req, res) => proxy.web(req, res, { target: 'https://api.cbd.int:443', secure: false } ));

// FOR DEV:
// app.all('/*', function(req, res) { proxy.web(req, res, { target: 'https://bch.cbd.int:443', secure: false } ); } );

// START HTTP SERVER

app.listen(process.env.PORT || 2000, '0.0.0.0', function(){
    console.log('Server listening on %j', this.address());
});

// Handle proxy errors ignore

proxy.on('error', function (err, req, res) {
    console.error('proxy error:', err);
    res.status(502).send();
});

process.on('SIGTERM', ()=>process.exit());
