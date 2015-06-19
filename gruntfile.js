/* jshint node:true */
module.exports = function(grunt) { 'use strict';

    // load all grunt tasks matching the ['grunt-*', '@*/grunt-*'] patterns
    require('load-grunt-tasks')(grunt);

    // Project configuration.
    grunt.initConfig({

        bower: {
            install: {
                options : {
                    targetDir : "./app/libs",
                    cleanTargetDir : true,
                    install : true,
                    copy : true,
                    bowerOptions : {
                        production : true
                    }
                }
             }
        },

        copy : {
            dist : {
                files : [{ //for font-awesome
                    expand: true,
                    dot: true,
                    cwd: 'bower_components/font-awesome/fonts/',
                    src: ['*.*'],
                    dest: 'app/libs/fonts'
                },
                { //bootstrap glyph-icons
                    expand: true,
                    dot: true,
                    cwd: 'bower_components/bootstrap/fonts/',
                    src: ['*.*'],
                    dest: 'app/libs/fonts'
                }]
            }
        },

        requirejs: {
          compile: {
            options: {
                appDir: "./app",
                baseUrl: ".",
                dir: "app_build",
                mainConfigFile: "app/boot.js",
                modules: [ {
                    name : "boot",
                    include: [
                        'views/lmos/decisions-lmo-id'
                    ]
                }] ,
                fileExclusionRegExp : /^intro/,
                inlineText : true,
                optimize : "uglify2",
                optimizeCss : "standard"
            }
          }
        }
    });

    grunt.registerTask('default',    ['bower', 'copy']);
};
