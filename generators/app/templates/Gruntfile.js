'use strict';

const _folder = require('wysknd-lib').folder;
const _utils = require('wysknd-lib').utils;
const _lambdaConfig = require('./src/lambda-config.json');
const _awsSdk = require('aws-sdk');
const DEPLOY_STACKS = ['dev', 'qa', 'prod', 'core', 'api'];

// Need to set project specific options here.
const DEFAULT_AWS_PROFILE = '<%= awsProfile %>';
const DEFAULT_AWS_REGION = '<%= awsRegion %>';
const DEFAULT_AWS_S3_BUCKET = `${ENV.appName}`;

// -------------------------------------------------------------------------------
//  Help documentation
// -------------------------------------------------------------------------------
/*esfmt-ignore-start*/
const HELP_TEXT =
'--------------------------------------------------------------------------------\n' +
' Defines tasks that are commonly used during the development process. This      \n' +
' includes tasks for linting, building and testing.                              \n' +
'                                                                                \n' +
' Supported Tasks:                                                               \n' +
'   [default]         : Performs standard pre-checkin activities. Runs           \n' +
'                       formatting on all source files, validates the files      \n' +
'                       (linting), and then executes tests against the files.    \n' +
'                                                                                \n' +
'   env               : Provides information regarding the current environment.  \n' +
'                       This an information only task that does not alter any    \n' +
'                       file/folder in the environment.                          \n' +
'                                                                                \n' +
'   help              : Shows this help message.                                 \n' +
'                                                                                \n' +
'   clean             : Cleans out all build artifacts and other temporary files \n' +
'                       or directories.                                          \n' +
'                                                                                \n' +
'   monitor:[<opt1>]: : Monitors files for changes, and triggers actions based   \n' +
'           [<opt2>]:   on specified options. Supported options are as follows:  \n' +
'           [<opt3>]     [lint]    : Performs linting with default options       \n' +
'                                    against all source files.                   \n' +
'                        [unit]    : Executes unit tests against all source      \n' +
'                                    files.                                      \n' +
'                        [e2e]     : Executes all defined end to end tests for   \n' +
'                                    the project.                                \n' +
'                                                                                \n' +
'                       Multiple options may be specified, and the triggers will \n' +
'                       be executed in the order specified. If a specific task   \n' +
'                       requires a web server to be launched, this will be done  \n' +
'                       automatically.                                           \n' +
'                                                                                \n' +
'   lint              : Performs linting of all source and test files.           \n' +
'                                                                                \n' +
'   format            : Formats source and test files.                           \n' +
'                                                                                \n' +
'   test:[unit|       : Executes unit or e2e tests against source files.         \n' +
'         e2e]                                                                   \n' +
'                                                                                \n' +
'   bump:[major|minor]: Updates the version number of the package. By default,   \n' +
'                       this task only increments the patch version number. Major\n' +
'                       and minor version numbers can be incremented by          \n' +
'                       specifying the "major" or "minor" subtask.               \n' +
'                                                                                \n' +
'  cf:[<action>]:     : Performs cloud formation actions on specific environment \n' +
'     [<stack>]         stacks.                                                  \n' +
'                       The first target specifies the action, which may be one  \n' +
'                       of the following:                                        \n' +
'                        [generate] : Generates the cloud formation template,    \n' +
'                                     but does not perform any other action.     \n' +
'                        [create]   : Generates the cloud formation template and \n' +
'                                     creates the stack in the cloud.            \n' +
'                        [update]   : Generates the cloud formation template and \n' +
'                                     updates an existing stack in the cloud.    \n' +
'                        [delete]   : Deletes an existing stack in the cloud. No \n' +
'                                     template will be generated.                \n' +
'                        [status]   : Checks on teh status of an existing stack  \n' +
'                                     in the cloud. No template will be          \n' +
'                                     generated.                                 \n' +
'                       The second target specifies the stack to perform the     \n' +
'                       action on, which may be one of the following:            \n' +
'                        [core]   : The core stack, which defines resources that \n' +
'                                   are common to the entire microservice. This  \n' +
'                                   typically includes lambda function and role  \n' +
'                                   definitions.                                 \n' +
'                        [api]    : The api stack that defines API gateway       \n' +
'                                   resources for the microservice.              \n' +
'                        [dev]    : A stack that defines development environment \n' +
'                                   specific resources.                          \n' +
'                        [qa]     : A stack that defines qa/testing environment  \n' +
'                                   specific resources.                          \n' +
'                        [prod]   : A stack that defines production environment  \n' +
'                                   specific resources.                          \n' +
'                                                                                \n' +
'  package            : Packages all lambda functions, and creates a package     \n' +
'                       file for deployment.                                     \n' +
'                                                                                \n' +
'  deploy             : Packages and then automatically deploys all defined      \n' +
'                       lambda functions in lambda-config.json. Note that the    \n' +
'                       functions are created in AWS via cloudformation by       \n' +
'                       running grunt cf:create. This method only updates the    \n' +
'                       the function code.                                       \n' +
'                                                                                \n' +
' Supported Options:                                                             \n' +
'   --test-suite      : Can be used to specify a unit test suite to execute when \n' +
'                       running tests. Useful when development is focused on a   \n' +
'                       small section of the app, and there is no need to retest \n' +
'                       all components when runing a watch.                      \n' +
'   --lambda-function : A regular expression that can be used to filter out      \n' +
'                       lambda functions when performing a deployment.           \n' +
'   --aws-profile     : The AWS profile against which the grunt task will        \n' +
'                       operate. If omitted, a default value (hard coded in the  \n' +
'                       Gruntfile) will be used.                                 \n' +
'   --aws-region      : The AWS region against which the grunt task will         \n' +
'                       operate. If omitted, a default value (hard coded in the  \n' +
'                       Gruntfile) will be used.                                 \n' +
'   --aws-s3-bucket   : The S3 bucket to use for storage of temporary files.     \n' +
'                       If omitted, a default value (hard coded in the Gruntfile)\n' +
'                       will be used.                                            \n' +
'                                                                                \n' +
' IMPORTANT: Please note that while the grunt file exposes tasks in addition to  \n' +
' ---------  the ones listed below (no private tasks in grunt yet :( ), it is    \n' +
'            strongly recommended that just the tasks listed below be used       \n' +
'            during the dev/build process.                                       \n' +
'                                                                                \n' +
'--------------------------------------------------------------------------------';
/*esfmt-ignore-end*/

module.exports = function(grunt) {
    /* ------------------------------------------------------------------------
     * Initialization of dependencies.
     * ---------------------------------------------------------------------- */
    //Time the grunt process, so that we can understand time consumed per task.
    require('time-grunt')(grunt);

    //Load all grunt tasks by reading package.json.
    require('load-grunt-tasks')(grunt);

    /* ------------------------------------------------------------------------
     * Build configuration parameters
     * ---------------------------------------------------------------------- */
    const packageConfig = grunt.file.readJSON('package.json') || {};

    const ENV = {
        appName: packageConfig.name || '__UNKNOWN__',
        appVersion: packageConfig.version || '__UNKNOWN__',
    /*esfmt-ignore-start*/
        tree: {                             /* ------------------------------ */
                                            /* <ROOT>                         */
            'src': null,                    /*  |--- src                      */
            'config': null,                 /*  |--- config                   */
            'test': {                       /*  |--- test                     */
                'unit': null,               /*  |   |--- unit                 */
                'e2e': null                 /*  |   |--- e2e                  */
            },                              /*  |                             */
            'resources': {                  /*  |--- resources                */
                'core': null,               /*  |    | --- core               */
                'api': null,                /*  |    | --- api                */
                'dev': null,                /*  |    | --- dev                */
                'qa': null,                 /*  |    | --- qa                 */
                'prod': null                /*  |    | --- prod               */
            },                              /*  |                             */
            'working': null,                /*  |--- working                  */
            'dist': null,                   /*  |--- dist                     */
            'coverage': null                /*  |--- coverage                 */
        }                                   /* ------------------------------ */
    /*esfmt-ignore-end*/
    };

    ENV.ROOT = _folder.createFolderTree('./', ENV.tree);

    (function _createTreeRefs(parent, subTree) {
        for (let folder in subTree) {
            const folderName = folder.replace('.', '_');
            parent[folderName] = parent.getSubFolder(folder);

            const children = subTree[folder];
            if (typeof children === 'object') {
                _createTreeRefs(parent[folder], children);
            }
        }
    })(ENV.ROOT, ENV.tree);

    // Shorthand references to key folders.
    const SRC = ENV.ROOT.src;
    const CONFIG = ENV.ROOT.config;
    const TEST = ENV.ROOT.test;
    const WORKING = ENV.ROOT.working;
    const DIST = ENV.ROOT.dist;
    const RESOURCES = ENV.ROOT.resources;

    // Cloud formation options
    const AWS_S3_CF_TEMPLATE_DIR = 'cf-templates';
    const _getStackName = (stackEnv) => {
        return `${ENV.appName}-${stackEnv}-stack`;
    };
    const _getTemplateName = (stackEnv) => {
        return `${ENV.appName}-${stackEnv}-template.json`;
    };
    const _getAwsRegion = () => {
        return grunt.option('aws-region') || DEFAULT_AWS_REGION;
    };
    const _getAwsProfile = () => {
        return grunt.option('aws-profile') || DEFAULT_AWS_PROFILE;
    };
    const _getAwsS3Bucket = () => {
        return grunt.option('aws-s3-bucket') || DEFAULT_AWS_S3_BUCKET;
    };

    /* ------------------------------------------------------------------------
     * Grunt task configuration
     * ---------------------------------------------------------------------- */
    grunt.initConfig({
        /**
         * Configuration for grunt-contrib-copy, which is used to:
         *  - Copy files to a distribution folder during build/packaging
         */
        copy: {
            compile: {
                files: [{
                    expand: true,
                    cwd: SRC.getPath(),
                    src: ['**'],
                    dest: WORKING.getPath()
                }, {
                    expand: true,
                    cwd: ENV.ROOT.getPath(),
                    src: [CONFIG.allFilesPattern('*')],
                    dest: WORKING.getPath()
                }, {
                    expand: false,
                    cwd: ENV.ROOT.getPath(),
                    src: ['package.json'],
                    dest: WORKING.getPath()
                }]
            }
        },

        /**
         * Configuration for grunt-contrib-clean, which is used to:
         *  - Remove temporary files and folders.
         */
        clean: {
            coverage: [ENV.ROOT.coverage.getPath()],
            working: [WORKING.getPath()],
            dist: [DIST.getPath()]
        },

        /**
         * Configuration for grunt-mocha-istanbul, which is used to:
         *  - Execute server side node.js tests, with code coverage
         */
        mocha_istanbul: {
            options: {
                reportFormats: ['text', 'html'],
                reporter: 'spec',
                colors: true
            },
            unit: [TEST.unit.allFilesPattern('js')],
            e2e: [TEST.e2e.allFilesPattern('js')]
        },

        /**
         * Configuration for lambda_package, which is a part of
         * grunt-aws-lamda. This task is used to:
         *  - Create a package for lambda deployment
         */
        lambda_package: {
            default: {
                options: {
                    package_folder: WORKING.getPath()
                }
            }
        },

        /**
         * Configuration for lambda_deploy, which is a part of
         * grunt-aws-lamda. This task is used to:
         *  - Deploy one or more lambda functions to the cloud
         */
        lambda_deploy: {
            default: {
                options: {
                    aliases: '',
                    enableVersioning: true
                },
                arn: ''
            }
        },

        /**
         * Configuration for grunt-esformatter, which is used to:
         *  - Format javascript source code
         */
        esformatter: {
            options: {
                plugins: [
                    'esformatter-ignore'
                ]
            },
            src: [
                'Gruntfile.js',
                SRC.allFilesPattern('js'),
                RESOURCES.allFilesPattern('js'),
                TEST.allFilesPattern('js')
            ]
        },

        /**
         * Configuration for grunt-eslint, which is used to:
         *  - Lint source and test files.
         */
        eslint: {
            dev: [
                'Gruntfile.js',
                SRC.allFilesPattern('js'),
                RESOURCES.allFilesPattern('js'),
                TEST.allFilesPattern('js')
            ]
        },

        /**
         * Configuration for grunt-contrib-watch, which is used to:
         *  - Monitor all source/test files and trigger actions when these
         *    files change.
         */
        watch: {
            allSources: {
                files: [SRC.allFilesPattern(), TEST.allFilesPattern()],
                tasks: []
            }
        },

        /**
         * Configuration for grunt-bump, which is used to:
         *  - Update the version number on package.json
         */
        bump: {
            options: {
                push: false
            }
        },

        /**
         * Configuration for grunt-contrib-wysknd-cloudformation, which is used
         * to:
         *  - Generate cloud formation JSON templates based on code driven
         *    specifications.
         */
        generate_cf_template: {
            options: {
                tokens: {
                    // TODO: Review and update as necessary.
                    // lambda_invoke_role: '<%= projectPrefix %>-api_gateway_role',
                    // s3_invoke_role: '<%= projectPrefix %>-api_gateway_role',
                    cors_origin: '\'*\''
                },
                output: {
                    dir: DIST.getPath()
                },
                input: {
                    rootDir: RESOURCES.getPath(),
                }
            },
            core: {
                description: '<%= projectName %> (CORE)',
                output: {
                    fileName: _getTemplateName('core')
                },
                input: {
                    templateDir: 'core'
                }
            },
            api: {
                description: '<%= projectName %> (API)',
                output: {
                    fileName: _getTemplateName('api')
                },
                input: {
                    templateDir: 'api'
                }
            },
            dev: {
                description: '<%= projectName %> (DEV)',
                output: {
                    fileName: _getTemplateName('dev')
                },
                input: {
                    templateDir: 'dev'
                }
            },
            qa: {
                description: '<%= projectName %> (QA)',
                output: {
                    fileName: _getTemplateName('qa')
                },
                input: {
                    templateDir: 'qa'
                }
            },
            prod: {
                description: '<%= projectName %> (PROD)',
                output: {
                    fileName: _getTemplateName('prod')
                },
                input: {
                    templateDir: 'prod'
                }
            }
        },

        /**
         * Configuration for grunt-aws-s3, which is used
         * to:
         *  - Upload resources to S3
         */
        aws_s3: {
            options: {
                awsProfile: _getAwsProfile(),
                bucket: _getAwsS3Bucket(),
                region: _getAwsRegion()
            },
            uploadCf: {
                action: 'upload',
                expand: true,
                cwd: DIST.getPath(),
                dest: AWS_S3_CF_TEMPLATE_DIR,
                differential: true
            }
        },

        /**
         * Configuration for grunt-aws-cloudformation, which is used
         * to:
         *  - Create and/or update stacks on cloudformation
         */
        cloudformation: {
            options: {
                region: _getAwsRegion(),
                profile: _getAwsProfile(),
                capabilities: ['CAPABILITY_NAMED_IAM']
            },
            status: {
                action: 'stack-status'
            },
            create: {
                action: 'create-stack'
            },
            update: {
                action: 'update-stack'
            },
            delete: {
                action: 'delete-stack'
            }
        }
    });

    /* ------------------------------------------------------------------------
     * Task registrations
     * ---------------------------------------------------------------------- */

    /**
     * Default task. Performs default tasks prior to checkin, including:
     *  - Beautifying files
     *  - Linting files
     *  - Building sources
     *  - Testing build artifacts
     *  - Cleaning up build results
     */
    grunt.registerTask('default', [
        'format',
        'lint',
        'test:unit',
        'clean']);

    /**
     * Create distribution package task. Creates a new distribution of the app,
     * ready for deployment.
     */
    grunt.registerTask('package', [
        'format',
        'lint',
        'build',
        'test:unit',
        'lambda_package',
        'clean:working']);

    /**
     * Create, update, delete or show status of the cloud formation resource
     * stack associated with the project.
     */
    grunt.registerTask('cf',
        'Enables create, update, delete or status check on the cloud formation stack for the specified deployment environment',
        function(action, stackEnv) {
            stackEnv = stackEnv || 'core';
            action = action || 'update';
            grunt.log.writeln(`Executing cloudformation action [${action}] for stack [${stackEnv}]`);
            if (DEPLOY_STACKS.indexOf(stackEnv) < 0) {
                grunt.log.error(`Invalid stack environment specified: [${stackEnv}]`);
                return;
            }
            if (['update', 'create', 'delete', 'status', 'generate'].indexOf(action) < 0) {
                grunt.log.error(`Invalid action specified: [${action}]`);
                return;
            }

            if (['update', 'create', 'generate'].indexOf(action) >= 0) {
                const templateName = _getTemplateName(stackEnv);
                grunt.log.debug('Generating cloudformation template and uploading to s3');
                grunt.task.run(`generate_cf_template:${stackEnv}`);

                if (['update', 'create'].indexOf(action) >= 0) {
                    grunt.config.set(`aws_s3.uploadCf.src`, templateName);
                    grunt.task.run('aws_s3:uploadCf');

                    grunt.config.set(`cloudformation.${action}.templateUrl`,
                        `https://s3.amazonaws.com/${_getAwsS3Bucket()}/${AWS_S3_CF_TEMPLATE_DIR}/${templateName}`);
                }
            }


            if (action !== 'generate') {
                grunt.config.set('cloudformation.options.stackName', _getStackName(stackEnv));
                grunt.task.run(`cloudformation:${action}`);
            }
        }
    );

    /**
     * Create distribution package and deploy it to AWS.
     */
    grunt.registerTask('deploy',
        'Prepares a package of the lambda functions, and deploys them all to the specified environment',
        function(stackEnv) {
            if (stackEnv !== 'prod') {
                stackEnv = 'dev';
            }
            if (DEPLOY_STACKS.indexOf(stackEnv) < 0) {
                grunt.log.error(`Invalid stack environment specified: [${stackEnv}]`);
                return;
            }
            grunt.task.run('package');
            grunt.task.run(`deploy_lambdas:${stackEnv}`);
        }
    );

    /**
     * Build task - performs a compilation on all source files
     *  - Copies all relevant files to the distribution directory
     */
    grunt.registerTask('build',
        'Performs a full build of all source files, preparing it for packaging/publication',
        function() {
            //This function could potentially do more at a later stage,
            //for example generating credential files for deployment
            //with lambdas, etc.

            grunt.task.run('clean:dist');
            grunt.task.run('clean:working');
            grunt.task.run('copy:compile');
        }
    );

    /**
     * Lambda deploy task. This task requires that the lambdas be
     * packaged using the lambda_package task.
     *  - Deploys all lambdas configured in lambda-config.json
     */
    grunt.registerTask('deploy_lambdas',
        'Deploys all defined lambda functions in the project',
        function(target, packageName) {
            if (target !== 'prod') {
                target = 'dev';
            }
            if (typeof packageName !== 'string' || packageName.length <= 0) {
                // Use the package name set by the default packaging task.
                packageName = grunt.config.get('lambda_deploy.default.package');
            }

            let functionNameFilter = grunt.option('lambda-function');
            if (typeof functionNameFilter !== 'string' ||
                functionNameFilter.length < 0) {
                functionNameFilter = '.*';
            } else {
                grunt.log.writeln(`Filtering lambdas using regex pattern: [${functionNameFilter}]`);
            }
            functionNameFilter = new RegExp(functionNameFilter);

            const iam = new _awsSdk.IAM({
                credentials: new _awsSdk.SharedIniFileCredentials({
                    profile: _getAwsProfile()
                })
            });

            const done = this.async();
            iam.getUser((err, data) => {
                if (err) {
                    grunt.log.error(`Unable to extract AWS information for profile: [${_getAwsProfile()}]`);
                    done(false);
                    return;
                }
                grunt.log.writeln(`Deploying lambda functions to: [${target}]`);
                const accountId = data.User.Arn.split(':')[4];
                const arnPrefix = `arn:aws:lambda:${_getAwsRegion()}:${accountId}:function:`;
                _lambdaConfig.lambdas.forEach((config) => {
                    if (!functionNameFilter.test(config.functionName)) {
                        grunt.log.debug(`Skipping function: [${config.functionName}]`);
                        return;
                    }
                    const arn = `${arnPrefix}${config.functionName}`;
                    const taskName = config.functionName;

                    // Create a different task for each call, because the calls are
                    // asynchronous
                    grunt.config.set(`lambda_deploy.${taskName}.options.aliases`, target);
                    grunt.config.set(`lambda_deploy.${taskName}.options.enableVersioning`, true);
                    grunt.config.set(`lambda_deploy.${taskName}.options.region`, _getAwsRegion());
                    grunt.config.set(`lambda_deploy.${taskName}.options.profile`, _getAwsProfile());
                    grunt.config.set(`lambda_deploy.${taskName}.arn`, arn);
                    grunt.config.set(`lambda_deploy.${taskName}.package`, packageName);
                    grunt.task.run(`lambda_deploy:${taskName}`);
                });
                done();
            });
        }
    );

    /**
     * Test task - executes lambda tests against code in dev only.
     */
    grunt.registerTask('test',
        'Executes tests against sources',
        function(testType) {
            let testAction;

            if (['unit', 'e2e'].indexOf(testType) >= 0) {
                testAction = `mocha_istanbul:${testType}`;
                const testSuite = grunt.option('test-suite');
                if (typeof testSuite === 'string' && testSuite.length > 0) {
                    const testBase = (testType === 'unit') ? TEST.unit : TEST.e2e;
                    const suitePath = testBase.getChildPath(testSuite);
                    grunt.log.writeln(`Running test suite: [${testSuite}], Path: [${suitePath}]`);
                    grunt.config.set(`mocha_istanbul.${testType}`, suitePath);
                }
            }

            if (testAction) {
                grunt.task.run(testAction);
            } else {
                grunt.log.warn('Unrecognized test type. Please see help (grunt help) for task usage information');
            }
        }
    );

    // Monitor task - track changes on different sources, and enable auto
    // execution of tests if requested.
    //  - If arguments are specified (see help) execute the necessary actions
    //    on changes.
    grunt.registerTask('monitor',
        'Monitors source files for changes, and performs actions as necessary',
        function() {
            const tasks = [];

            // Process the arguments (specified as subtasks).
            Array.prototype.slice.call(arguments).forEach((arg) => {
                if (arg === 'lint') {
                    tasks.push('lint');

                } else if (arg === 'unit') {
                    tasks.push('test:unit');

                } else if (arg === 'e2e') {
                    tasks.push('test:e2e');

                } else {
                    // Unrecognized argument.
                    grunt.log.warn('Unrecognized argument: %s', arg);
                }
            });

            if (tasks.length > 0) {
                grunt.config.set('watch.allSources.tasks', tasks);
                grunt.log.writeln('Tasks to run on change: [' + tasks + ']');
                grunt.task.run('watch:allSources');
            } else {
                grunt.log.writeln('No tasks specified to execute on change');
            }
        }
    );

    /**
     * Shows the environment setup.
     */
    grunt.registerTask('env',
        'Shows the current environment setup',
        function() {
            const separator = new Array(80).join('-');
            function _showRecursive(root, indent) {
                let indentChars = '  ';
                if (!indent) {
                    indent = 0;
                } else {
                    indentChars += '|';
                }
                indentChars += new Array(indent).join(' ');
                indentChars += '|--- ';
                let hasChildren = false;
                for (let prop in root) {
                    const member = root[prop];
                    if (typeof member === 'object') {
                        const maxLen = 74 - (indentChars.length + prop.length);
                        const status = _utils.padLeft(member.getStatus(), maxLen);

                        grunt.log.writeln(indentChars + prop + status);
                        hasChildren = true;
                        if (_showRecursive(member, indent + 4)) {
                            grunt.log.writeln('  |');
                        }
                    }
                }

                return hasChildren;
            }

            grunt.log.writeln('\n' + separator);
            _showRecursive(ENV.ROOT, 0);
            grunt.log.writeln(separator + '\n');
        }
    );

    /**
     * Lint task - checks source and test files for linting errors.
     */
    grunt.registerTask('lint', ['eslint:dev']);

    /**
     * Formatter task - formats all source and test files.
     */
    grunt.registerTask('format', ['esformatter']);

    /**
     * Shows help information on how to use the Grunt tasks.
     */
    grunt.registerTask('help',
        'Displays grunt help documentation',
        function() {
            grunt.log.writeln(HELP_TEXT);
        }
    );
};
