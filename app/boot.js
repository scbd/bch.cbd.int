(function(window, document) { 'use strict';

require.config({
    waitSeconds: 30,
    baseUrl : '/app/',
    paths: {
        'ngCookies' : 'libs/angular-cookies/angular-cookies.min',
        'diacritics': 'libs/diacritic/diacritics',
        'text'      : 'libs/requirejs-text/text', 

        // loaded from Bch.UI.ngView c# module
        'jquery'    : 'libs/jquery/dist/jquery.min',
        'lodash'    : 'libs/lodash/lodash.min',
        'angular-flex'   : 'libs/angular-flex/angular-flex',
        'angular'   : 'libs/angular/angular.min',
        'ngRoute'   : 'libs/angular-route/angular-route.min',
        'ngSanitize': 'libs/angular-sanitize/angular-sanitize.min',
        'bootstrap': 'https://maxcdn.bootstrapcdn.com/bootstrap/3.3.1/js/bootstrap.min',
    },
    shim: {
        'ngCookies' : { deps: ['angular'] },

        // loaded from Bch.UI.ngView c# module
        'angular'              : { deps: ['jquery'], 'exports': 'angular' },
        'bootstrap'             : { deps: ['jquery'] },
        'angular-flex'         : { 'deps': ['angular'] },
        'ngRoute'              : { deps: ['angular'] },
        'ngSanitize'           : { deps: ['angular'] },
    }
});

// Define module loaded from Bch.UI.ngView c# module;

// if (!require.defined('jquery'))     { define('jquery',     [],          function()   { return window.$; }); }
// if (!require.defined('lodash'))     { define('lodash',     [],          function()   { return window._; }); }
// if (!require.defined('angular'))    { define('angular',    [],          function()   { return window.angular; }); }
// if (!require.defined('ngRoute'))    { define('ngRoute',    ['angular'], function(ng) { return ng.module('ngRoute'); }); }
// if (!require.defined('ngSanitize')) { define('ngSanitize', ['angular'], function(ng) { return ng.module('ngSanitize'); }); }

// BOOT
require(['angular', 'angular-flex', 'bootstrap' ], function(ng, s) {
    console.log(ng, s)
    require(['app', 'routes', 'index'], function(app) {
        ng.element(document).ready(function(){
            ng.bootstrap(document, [app.name]);
        });
    });
});

})(window, document);

// MISC

//==================================================
// Fix IE Console
// Protect window.console method calls, e.g. console is not defined on IE
// unless dev tools are open, and IE doesn't define console.debug
//==================================================
(function(a){a.console||(a.console={});for(var c="log info warn error debug trace dir group groupCollapsed groupEnd time timeEnd profile profileEnd dirxml assert count markTimeline timeStamp clear".split(" "),d=function(){},b=0;b<c.length;b++)a.console[c[b]]||(a.console[c[b]]=d)})(window); //jshint ignore:line
