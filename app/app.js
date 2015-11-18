define(['angular', 'ngSanitize'], function(ng) { 'use strict';

	var deps = ['ngRoute', 'ngCookies', 'ngSanitize'];

	ng.defineModules(deps);

	var app = ng.module('app', deps);

    app.value('locale', getLocale());
    define   ('locale', getLocale());

	return app;

    //========================================
    //
    //
    //========================================
    function getLocale() {

        var matches = /Preferences=Locale=(\w{2,3})/g.exec(document.cookie);

        if(matches)
            return matches[1]; //

        return 'en';
    }
});
