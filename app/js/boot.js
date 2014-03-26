'use strict';

window.name = 'NG_DEFER_BOOTSTRAP!';

require.config({
    baseUrl : '/app/js',
    waitSeconds: 60,
    paths: {
        'angular'         : '../libs/angular/angular.min',
        'angular-route'   : '../libs/angular-route/angular-route.min',
        'angular-cookies' : '../libs/angular-cookies/angular-cookies.min',
        'domReady'        : '../libs/requirejs-domready/domReady',
        'underscore'      : '../libs/underscore/underscore'
//      'jquery'          : '../libs/jquery/dist/jquery.min'   //define in BCH template!
    },
    shim: {
        'angular'         : { 'deps': ['jquery'], 'exports': 'angular' },
        'angular-route'   : { 'deps': ['angular'] },
        'angular-cookies' : { 'deps': ['angular'] }
    }
});

if (!require.defined("jquery") && $) { //HACK: jquery is loaded in the template without define/AMD :-(
	define("jquery", [], function() {  
		return window.$;
	});
}

require(['angular', 'angular-route', 'angular-cookies', 'domReady'], function (ng) {

    // NOTE: place operations that need to initialize prior to app start here using the `run` function on the top-level module

    require(['domReady!', 'app', 'app_routes'], function (document) {
        ng.bootstrap(document, ['app']);
        ng.resumeBootstrap();
    });
});

