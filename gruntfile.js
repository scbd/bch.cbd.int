'use strict';
/* jshint node:true */
module.exports = function(grunt) {

  // load all grunt tasks automatically
  require('load-grunt-tasks')(grunt);

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    bower: {
      install: {
        //just run 'grunt bower:install' and you'll see files from your Bower packages in lib directory
      }
    },
      // configurable paths
    app: require('./bower.json').appPath || 'app',
    express: {
      options: {
        port: process.env.PORT || 2010
      },
      dev: {
        options: {
          script: 'server.js'
        }
      }
    },
  });

  grunt.registerTask('default', ['bower']);
};