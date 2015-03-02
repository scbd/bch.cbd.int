define(['angular'], function(ng) { 'use strict';

	predefineModule('ngCookies');
	predefineModule('ngRoute');

	return ng.module('app', ['ngCookies', 'ngRoute']);

	//==================================================
	//
	//
	//==================================================
	function predefineModule(moduleName) {

		try
		{
			return ng.module(moduleName);
		}
		catch(e)
		{
			return ng.module(moduleName, []);
		}
	}
});
