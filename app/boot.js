(function(window, document) { 'use strict';

require.config({
    waitSeconds: 30,
    baseUrl : '/app/',
    paths: {
        'angular'   : 'libs/angular-flex/angular-flex',
        'ngRoute'   : 'libs/angular-route/angular-route.min',
        'ngCookies' : 'libs/angular-cookies/angular-cookies.min',
        'ngSanitize': 'libs/angular-sanitize/angular-sanitize.min',
        'lodash'    : 'libs/lodash/lodash.min',
        'text'      : 'libs/requirejs-text/text',
        'jquery'    : 'libs/jquery/dist/jquery.min',
        'diacritics': 'libs/diacritic/diacritics'
    },
    shim: {
        'angular'              : { deps: ['libs/angular/angular.min'] },
        'libs/angular/angular' : { deps: ['jquery'] },
        'ngRoute'              : { deps: ['angular'] },
        'ngSanitize'           : { deps: ['angular'] },
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
require(['angular', 'app', 'routes'], function(ng, app) {

    ng.element(document).ready(function(){
        ng.bootstrap(document, [app.name]);
    });

});
})(window, document);

// MISC

//==================================================
// Protect window.console method calls, e.g. console is not defined on IE
// unless dev tools are open, and IE doesn't define console.debug
//==================================================
(function fixIEConsole() { 'use strict';

    if (!window.console) {
        window.console = {};
    }

    var methods = ["log", "info", "warn", "error", "debug", "trace", "dir", "group","groupCollapsed", "groupEnd", "time", "timeEnd", "profile", "profileEnd", "dirxml", "assert", "count", "markTimeline", "timeStamp", "clear"];
    var noop    = function() {};

    for(var i = 0; i < methods.length; i++) {
        if (!window.console[methods[i]])
            window.console[methods[i]] = noop;
    }
})();
