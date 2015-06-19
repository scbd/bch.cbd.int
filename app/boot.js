fixIEConsole();

window.name = 'NG_DEFER_BOOTSTRAP!';

require.config({
    waitSeconds: 120,
    paths: {
        'angular'         : 'libs/angular-flex/angular-flex',
        'ngRoute'         : 'libs/angular-route/angular-route',
        'ngCookies'       : 'libs/angular-cookies/angular-cookies',
        'domReady'        : 'libs/requirejs-domready/domReady',
        'lodash'          : 'libs/lodash/lodash',
        'jquery'          : 'libs/jquery/jquery',
        'authentication'  : 'services/authentication'
    },
    shim: {
        'angular'              : { deps: ['libs/angular/angular'] },
        'libs/angular/angular' : { deps: ['jquery'] },
        'ngRoute'              : { deps: ['angular'] },
        'ngCookies'            : { deps: ['angular'] }
    }
});

//HACK: jquery is loaded in the BCH template without define/AMD :-(
if (!require.defined('jquery') && window.$) {
	define('jquery', [], function() {
		return window.$;
	});
}

// BOOT

require(['angular', 'domReady!', 'app', 'routes'], function(ng, doc){
    ng.bootstrap(doc, ['app']);
    ng.resumeBootstrap();
});

//==================================================
// Protect window.console method calls, e.g. console is not defined on IE
// unless dev tools are open, and IE doesn't define console.debug
//==================================================
function fixIEConsole() { 'use strict';

    if (!window.console) {
        window.console = {};
    }

    var methods = ["log", "info", "warn", "error", "debug", "trace", "dir", "group","groupCollapsed", "groupEnd", "time", "timeEnd", "profile", "profileEnd", "dirxml", "assert", "count", "markTimeline", "timeStamp", "clear"];
    var noop    = function() {};

    for(var i = 0; i < methods.length; i++) {
        if (!window.console[methods[i]])
            window.console[methods[i]] = noop;
    }
}