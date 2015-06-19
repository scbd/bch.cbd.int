define(['angular'], function(ng) { 'use strict';

	var deps = ['ngRoute', 'ngCookies'];

	ng.defineModules(deps);

	var app = ng.module('app', deps);

	return app;
});
