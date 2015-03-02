require.config({
    waitSeconds: 120,
    baseUrl : '/app',
    paths: {
        'app'    : 'lmos/app',
        'routes' : 'lmos/routes'
    },
    config : {
        boot : { modules : ['routes'] }
    }
});

// BOOT

require(['boot']);
