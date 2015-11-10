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

// START HTTP SERVER

app.listen(process.env.PORT || 2000, '0.0.0.0', function(){
    console.log('Server listening on %j', this.address());
});

// Handle proxy errors ignore

proxy.on('error', function (e,req, res) {
    console.error('proxy error:', e);
    res.status(502).send();
});

process.on('SIGTERM', ()=>process.exit());
