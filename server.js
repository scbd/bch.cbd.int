// CREATE HTTP SERVER AND PROXY

var app     = require('express')();
var proxy   = require('http-proxy').createProxyServer({});

// LOAD CONFIGURATION

app.use(require('morgan')('dev'));
app.use(require('compression')());

// Configure routes

app.use('/app',   require('serve-static')(__dirname + '/app_build'));
app.use('/app',   require('serve-static')(__dirname + '/app'));
app.all('/app/*', function(req, res) { res.status(404).send(); } );
app.all('/api/*', function(req, res) { proxy.web(req, res, { target: 'https://api.cbd.int:443', secure: false } ); } );

// FOR DEV:
// app.all('/*', function(req, res) { proxy.web(req, res, { target: 'https://bch.cbd.int:443', secure: false } ); } );

// Start server

app.listen(process.env.PORT || 2050, function () {
	console.log('Server listening on %j', this.address());
});
