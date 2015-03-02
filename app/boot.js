fixIEConsole();

window.name = 'NG_DEFER_BOOTSTRAP!';

require.config({
    waitSeconds: 120,
    paths: {
//        'angular'         : 'libs/angular/angular.min',
        'angular-route'   : 'libs/angular-route/angular-route',
        'angular-cookies' : 'libs/angular-cookies/angular-cookies',
        'domReady'        : 'libs/requirejs-domready/domReady',
        'underscore'      : 'libs/underscore/underscore'
//      'jquery'          : 'libs/jquery/dist/jquery.min'   //define in BCH template!
    },
    shim: {
        'libs/angular/angular.min' : { 'deps': ['jquery'], 'exports': 'angular' },
        'angular-route'   : { 'deps': ['angular'] },
        'angular-cookies' : { 'deps': ['angular'] }
    }
});

if (!require.defined('jquery') && window.$) { //HACK: jquery is loaded in the template without define/AMD :-(
	define('jquery', [], function() {
		return window.$;
	});
}

define('angular', ['libs/angular/angular.min'], function (ng) { 'use strict';

    var ng_module = ng.module.bind(ng);

    ng.module = function(moduleName, deps) {

        if(deps===undefined)
            return ng_module(moduleName)

        var module = null;

        try
        {
            module = ng_module(moduleName);
        }
        catch(e)
        {
            module = ng_module(moduleName, deps);

            (function(module) {

                module.config(['$controllerProvider', '$compileProvider', '$provide', '$filterProvider',
                       function($controllerProvider,   $compileProvider,   $provide,   $filterProvider) {

                        // Allow dynamic registration

                        module.filter     = $filterProvider.register;
                        module.provider   = $provide.provider;
                        module.factory    = $provide.factory;
                        module.value      = $provide.value;
                        module.controller = $controllerProvider.register;
                        module.directive  = $compileProvider.directive;
                    }
                ]);

            })(module);
        }

        return module;
    }

    return ng;

});


define(['module'], function (module) { 'use strict';


    var config  = module.config();
    var modules = ['domReady!', 'angular', 'app'];

    for(var i in config.modules)
        modules.push(config.modules[i]);

    require(modules, function (doc, ng) {

        ng.bootstrap(doc, ['app']);
        ng.resumeBootstrap();

    });
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
