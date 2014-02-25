module.exports = function(grunt) {
    'use strict';

    var root = require('path').resolve('../../../');
    var currentExtension = grunt.option('extension') || 'tao';  
    var ext = require('./tasks/helpers/extensions')(grunt, root);
    var sources = {};

    // load all grunt tasks matching the `grunt-*` pattern
    require('load-grunt-tasks')(grunt);
    
    //load the source map generated by the task sourcefinder
    
    if(grunt.file.exists('./config/sources.json')){
        sources = require('./config/sources.json');
    } else {
        grunt.log.warn('Please consider generating the source map using `grunt install` ');
        sources = { jshint: [], jsbaselibs : [],  qtiRuntime : [] };
    }

    
    //build some dynamic values for the config regarding the current extensions 
    var amdBundles = [];
    var copies = [];
    ext.getExtensions(true).forEach(function(extension){
        amdBundles.push({
            name: extension + '/controller/routes',
            include : ext.getExtensionsControllers([extension]),
            exclude : ['main', 'i18n_tr']
       });
       copies.push({
           src: ['output/'+ extension +'/controller/routes.js'],  
           dest: ext.getExtensionPath(extension) + '/views/js/controllers.min.js'
       });
    });

    /**
     * 
     * Set up Grunt config
     * 
     */
    grunt.initConfig({
       
        //tao dynamic source finder
        sourcefinder : {
            dist : {
                src : '../../../',
                dest: 'config/sources.json', 
                options: {
                    inConfig : 'sources'
                },
                sources : {
                    'jshint' : {
                        pattern: ['views/js/**/*.js', '!views/js/lib/**/*.js', '!views/js/**/*.min.js'],
                        extension: 'current'
                    },
                    'jsbaselibs' : {
                        pattern : ['views/js/*.js', '!views/js/main.js', '!views/js/*.min.js', '!views/js/test/**/*.js'],
                        extension: 'tao',
                        amdify : true
                    },
                    'qtiruntime' : [{
                        pattern : ['views/js/qtiItem/core/**/*.js', 'views/js/qtiDefaultRenderer/renderers/**/*.js',  'views/js/qtiDefaultRenderer/widgets/**/*.js'],
                        extension: 'taoQTI',
                        replacements : function(file){
                            return  file.replace('taoQTI/qtiItem', 'taoQtiItem')
                                        .replace('taoQTI/qtiRunner', 'taoQtiRunner')
                                        .replace('taoQTI/qtiDefaultRenderer', 'taoQtiDefaultRenderer');
                        },
                        amdify : true
                    }, {
                        pattern : ['views/js/qtiDefaultRenderer/tpl/**/*.tpl'],
                        extension: 'taoQTI',
                        replacements : function(file){
                            return  'tpl!' + file.replace(/\.(tpl)$/, '')
                                        .replace('taoQTI/qtiDefaultRenderer', 'taoQtiDefaultRenderer');
                        },
                        amdify : true
                    }]
                }
            }
        },
        
        clean: {
            options:  {
                force : true
            },
            install : ['output' ],
            backendBundle : ['output',  '../js/main.min.js', '../../../*/views/js/controllers.min.js'],
            qtiBundle : ['output', '../../../taoQTI/views/js/runtime/qtiLoader.min.js', '../../../taoQTI/views/js/runtime/qtiBoostrap.min.js']
        },
        
        copy : {
            
            //copy the optimized resources
            backendBundle : {
                files: [
                    { src: ['output/main.js'],  dest: '../js/main.min.js' },
                    { src: ['output/controller/routes.js'],  dest: '../js/controllers.min.js' }
                ].concat(copies)
            }
        },
        
        uglify : {
            //the qti loader is uglify outside the r.js to split the file loading (qtiLoader.min published within the item and qtiBootstrap shared)
            qtiBundle : { 
                files : { 
                    'output/qtiLoader.min.js' : ['../js/lib/require.js', '../../../taoQTI/views/js/runtime/qtiLoader.js']
                }
            }
        },
        
        
        replace : {
            
            //we need to change the names of AMD modules to referr to minimified verrsions
            qtiBundle : { 
                 options: {
                     patterns: [{
                        match : 'taoQTI/runtime/qtiBootstrap',
                        replacement:  'taoQTI/runtime/qtiBootstrap.min',
                        expression: false
                     }],
                     force : true,
                     prefix: ''
                 },
                 files : [ 
                     { src: ['output/qtiBootstrap.min.js'],  dest: '../../../taoQTI/views/js/runtime/qtiBootstrap.min.js' },
                     { src: ['output/qtiLoader.min.js'],  dest: '../../../taoQTI/views/js/runtime/qtiLoader.min.js' }
                 ]
             }
        },
        
        /**
         * Optimize JavaScript files
         */
        requirejs: {
            
            //common options
            options : {
                optimize: 'uglify2',
                preserveLicenseComments: false,
                optimizeAllPluginResources: false,
                findNestedDependencies : true,
                optimizeCss : false,
                inlineText: true,
                paths : ext.getExtensionsPaths()
            },
            
            /**
             * Compile the javascript files of all TAO backend's extension to one file!
             * Not yet used as it doesn't fit the extension model
             */
            backendAll: {
                options: {
                    baseUrl : '../js',
                    out: '../js/main.min.js',
                    name: 'main',
                    mainConfigFile : './config/backend.js',
                    include: ['lib/require'].concat(ext.getExtensionsControllers()),
                    exclude : ['i18n_tr']
                }
            },
            
            /**
             * Compile the javascript files of all TAO backend's extension bundles, 
             * a common bundle (tao's main libs) and extension controlers
             */
            backendBundle : {
                 options: {
                    baseUrl : '../js',
                    dir : 'output',
                    mainConfigFile : './config/requirejs.build.js',
                    modules : [{
                        name: 'main',
                        include: [
                            'lib/require'
                        ],
                        deps : sources.jsbaselibs,
                        exclude : ['i18n_tr']
                    }].concat(amdBundles)
                }
            },
            
            /**
             * Create a specific bundle for the QTI runtime
             */
            qtiBundle : {
                options: {
                    baseUrl : '../js',
                    out: 'output/qtiBootstrap.min.js',
                    name: 'taoQTI/runtime/qtiBootstrap',
                    optimizeAllPluginResources: true,
                    mainConfigFile : './config/requirejs.build.js',
                    paths: {
                       'taoQTI' : '../../../taoQTI/views/js'
                    },
                    include: sources.qtiRuntime,
                    exclude : ['i18n_tr', 'mathJax', 'mediaElement']
                }
            }
        },

        /**
         * Check your code style by extension
         * grunt jshint --extension=taoItem
         */
        jshint : {
            options : {
                jshintrc : '.jshintrc'
            },
            all : {
                src : sources.jshint
            },
            file : {
                 src : grunt.option('file')
            },
            extension : {
                src : ext.getExtensionSources(currentExtension, ['views/js/**/*.js'])
            }
        },
        
        
        /**
         * Compile SASS to CSS
         * grunt jshint --extension=taoItems
         */
        sass : {
            options : {
                includePaths : ['../scss/', '../js/lib/']
            },
            
            /*
             * 
--no-cache --update --debug --load-path a --load-path b --load-path c C:/htdocs/tao/tao/tao/views/scss C:/htdocs/tao/tao/tao/views/js/lib C:/htdocs/tao/tao/taoQTI/views/scss $FileName$:../css/$FileNameWithoutExtension$.css
             */
            compile : {
                files : {
                    '../css/tao-main-style.css' : '../scss/tao-main-style.scss',
                    '../css/layout.css' : '../scss/layout.scss',
                    '../../../taoCe/views/css/home.css' : '../../../taoCe/views/scss/home.scss',
                    '../../../taoQtiTest/views/css/creator.css' : '../../../taoQtiTest/views/scss/creator.scss'
                }
            },
            qti : {
                 files : {
                    '../../../taoQTI/views/css/item-creator.css' : '../../../taoQTI/views/scss/item-creator.scss',
                    '../../../taoQTI/views/css/qti.css' : '../../../taoQTI/views/scss/qti.scss'
                 },
                 options : {
                    includePaths : ['../scss/', '../js/lib/', '../../../taoQTI/views/scss/inc', '../../../taoQTI/views/scss/qti']
                }
            }
        },
        

        /**
         * Runs a task by watching on file changes (used for development purpose)
         */
        watch : {
            
            /**
             * Watch SASS changes and compile on the fly!
             */
            'sass' : {
                files : ['../scss/*.scss', '../scss/**/*.scss', '../../../*/views/scss/**/*.scss'],
                tasks : ['sass:compile'],
                options : {
                    debounceDelay : 500
                }
            },
            
            'qtisass' : {
                files : ['../../../taoQTI/views/scss/**/*.scss'],
                tasks : ['sass:qti'],
                options : {
                    debounceDelay : 500
                }
            }
        }
    });

     // Load local tasks.
    grunt.loadTasks('tasks');

    grunt.registerTask('install', "Set up app and build", ['clean:install', 'sourcefinder']);
    
    grunt.registerTask('backendBundle', "Create JavaScript bundles for TAO backend",
                        ['clean:backendBundle', 'requirejs:backendBundle', 'copy:backendBundle']);
                        
    grunt.registerTask('qtiBundle', "Create JavaScript bundles for QTI runtimes",
                        ['clean:qtiBundle', 'requirejs:qtiBundle', 'uglify:qtiBundle', 'replace:qtiBundle']);
                        
    grunt.registerTask('jsBundle', "Create JavaScript bundles for the whole TAO plateform",
                        ['backendBundle', 'qtiBundle']);

    grunt.registerTask('build', "The full build sequence", ['jsBundle']);
};
