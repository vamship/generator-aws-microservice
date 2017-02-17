'use strict';

const _yeoman = require('yeoman-generator');
const _pascalCase = require('pascalcase');

const _fsUtils = require('../../utils/fs-utils');
const _consts = require('../../utils/constants');

module.exports = _yeoman.Base.extend({
    /**
     * Initializes the generator.
     */
    constructor: function() {
        _yeoman.Base.apply(this, arguments);
        this.availableResources = ['/'];
        this.availableAuthorizers = ['NONE'];
        this.availableLambdas = null;
        this.availableModels = ['NONE', 'CREATE NEW'];
    },

    /**
     * Shows a the title of the sub generator, and a brief description.
     */
    showTitle: function() {
        this.log(_consts.SEPARATOR);
        this.log('Create a REST API method:\n');
        this.log();
    },

    /**
     * Queries the project to identify all defined resources that can serve as
     * parent resources to a method.
     */
    lookupAvailableResources: function() {
        const done = this.async();
        const path = this.destinationPath('resources/api');
        _fsUtils.getSubDirectoryPaths(path).then((dirList) => {
            const pathRegex = new RegExp(`${path}/?`);
            this.availableResources = dirList.filter((item) => {
                return !item.match(/\/_models$/);
            }).map((item) => {
                return item.replace(/^[a-zA-Z]*:/,'')  // Handle windows drive letter
                            .replace(/\\/g, '/')       // Handle windows path separator
                            .replace(pathRegex, '/');
            });
            done();
        }).catch((ex) => {
            this.env.error('Error listing existing API resources');
            done(ex);
        });
    },

    /**
     * Queries the project to identify all defined authorizers that can be
     * attached to methods.
     */
    lookupAvailableAuthorizers: function() {
        const done = this.async();
        const path = this.destinationPath('resources/api');
        const pattern = /-authorizer\.js$/;
        _fsUtils.getFilesInDir(path, (parent, fileName, stats) => {
            if(!stats.isDirectory() && fileName.match(pattern)) {
                return fileName.replace(pattern,'').replace(/-/g, '_');
            }
        }).then((results) => {
            this.availableAuthorizers = this.availableAuthorizers.concat(results);
            done();
        }).catch((ex) => {
            done(ex);
        });
    },

    /**
     * Queries the project to identify all defined models that can be
     * attached to methods.
     */
    lookupAvailableModels: function() {
        const done = this.async();
        const path = this.destinationPath('resources/api/_models');
        const pattern = /-model\.js$/;
        _fsUtils.getFilesInDir(path, (parent, fileName, stats) => {
            if(!stats.isDirectory() && fileName.match(pattern)) {
                return _pascalCase(fileName.replace(pattern,''));
            }
        }).then((results) => {
            this.availableModels = this.availableModels.concat(results);
            done();
        }).catch((ex) => {
            if(ex.code === 'ENOENT') {
                // The _models directory has not been created yet. Skip.
                return done();
            }
            done(ex);
        });
    },

    /**
     * Queries the project to identify all defined lambda functions that can
     * serve as event handlers.
     */
    lookupAvailableLambdas: function() {
        const lambdaConfig = this.fs.readJSON(
            this.destinationPath('src/lambda-config.json'), {
                lambdas: []
            }
        );
        this.availableLambdas = lambdaConfig.lambdas.map((lambda) => {
            return lambda.functionName;
        });
    },

    /**
     * Gathers resource information
     */
    gatherResourceInfo: function () {
        const modelNameValidator = (response) => {
            const pattern = /^[a-zA-Z0-9]+$/;
            if(response === '' || response.match(pattern)) {
                return true;
            }
            return 'If non empty, a valid model name must be specified';
        };
        const prompts = [{
            type: 'list',
            name: 'apiMethodResource',
            message: 'Choose a resource to create the method under',
            choices: this.availableResources,
            default: 0
        }, {
            type: 'list',
            name: 'apiMethodVerb',
            message: 'HTTP action?',
            choices: [ 'GET', 'POST', 'PUT', 'DELETE' ],
            default: 0
        }, {
            type: 'list',
            name: 'apiMethodAuthorizer',
            message: 'Choose an authorizer to secure the method',
            choices: this.availableAuthorizers,
            default: 0
        }, {
            type: 'list',
            name: 'apiMethodAuthorizerType',
            message: 'Authorizer type?',
            choices: [ 'COGNITO_USER_POOLS', 'CUSTOM' ],
            default: 0,
            when: answers => answers.apiMethodAuthorizer !== 'NONE'
        }, {
            type: 'confirm',
            name: 'apiMethodEnableCors',
            message: 'Enable CORS?',
            default: true
        }, {
            type: 'list',
            name: 'apiMethodBackendType',
            message: 'Select a back end integration for the method?',
            choices: ['MOCK', 'S3', 'LAMBDA'],
            default: 2,
            validate: (response) => {
                if(response === 'LAMBDA' && (!this.availableLambdas ||
                    this.availableLambdas.length <= 0)) {
                    return 'No lambdas defined for the current project';
                }
                return true;
            }
        }, {
            type: 'list',
            name: 'apiMethodLambda',
            message: 'Select the lambda that will handle the request',
            when: answers => answers.apiMethodBackendType === 'LAMBDA',
            choices: this.availableLambdas,
            default: 0
        }, {
            type: 'input',
            name: 'apiMethodS3Path',
            message: 'Specify an S3 integration path',
            when: answers => answers.apiMethodBackendType === 'S3',
            validate: (response) => {
                const pattern = /^(\/({[a-zA-Z0-9\._-]+}|[a-zA-Z0-9\._-]+))+$/;
                if(response.match(pattern)) {
                    return true;
                }
                return 'Resource name can only contain letters, numbers, "_", "-" and ".".\n  Parameterized resource paths should be surrounded by "{}"';
            }
        }, {
            type: 'list',
            name: 'apiMethodRequestModel',
            message: 'Select a model that defines the method request',
            choices: this.availableModels,
            default: 0
        }, {
            type: 'input',
            name: 'apiMethodRequestModelName',
            message: 'New request model name (ex: CreateUserRequest)?',
            when: answers => answers.apiMethodRequestModel === 'CREATE NEW',
            default: '',
            validate: modelNameValidator
        }, {
            type: 'list',
            name: 'apiMethodResponseModel',
            message: 'Select a model that defines the method response',
            choices: this.availableModels,
            default: 0
        }, {
            type: 'input',
            name: 'apiMethodResponseModelName',
            message: 'New response model name (ex: CreateUserRequest)?',
            when: answers => answers.apiMethodResponseModel === 'CREATE NEW',
            default: '',
            validate: modelNameValidator
        }];

        return this.prompt(prompts).then((props) => {
            this.props = Object.assign(this.props || {}, props);
            if(this.props.apiMethodRequestModel === 'NONE') {
                this.props.apiMethodRequestModelName = '';
            }
            if(this.props.apiMethodResponseModel === 'NONE') {
                this.props.apiMethodResponseModelName = '';
            }
        });
    },

    /**
     * Generate request/response models by composing sub generators.
     */
    compose: function () {
        if(this.props.apiMethodRequestModelName !== '') {
            this.composeWith(`${_consts.GENERATOR_NAME}:${_consts.SUB_GEN_API_MODEL}`, {
                options: {
                    apiModelTitle: 'Creating a REQUEST MODEL for the method\n',
                    apiModelName: this.props.apiMethodRequestModelName,
                    apiModelDescription: `Request model for ${this.props.apiMethodVerb} ${this.props.apiMethodResource}`
                }
            });
        }
        if(this.props.apiMethodResponseModelName !== '') {
            this.composeWith(`${_consts.GENERATOR_NAME}:${_consts.SUB_GEN_API_MODEL}`, {
                options: {
                    apiModelTitle: 'Creating a RESPONSE MODEL for the method\n',
                    apiModelName: this.props.apiMethodResponseModelName,
                    apiModelDescription: `Response model for ${this.props.apiMethodVerb} ${this.props.apiMethodResource}`
                }
            });
        }
    },

    /**
     * Creates cloud formation template for the api method
     */
    createMethodTemplate: function() {
        const methodFile = this.props.apiMethodVerb.toLowerCase();
        const resource = this.props.apiMethodResource === '/' ? '':this.props.apiMethodResource;
        this.fs.copyTpl(
            this.templatePath(`resources/api/_resource/method.js`),
            this.destinationPath(`resources/api${resource}/${methodFile}.js`),
            this.props
        );
    },

    /**
     * Finish up and show user messae.
     */
    finish() {
        this.log('A new API method will be created. You will have to update the request and response mappings within the template');
    }
});
