'use strict';

const _yeoman = require('yeoman-generator');
const _decamelize = require('decamelize');

const _prompts = require('../../utils/prompts');
const _consts = require('../../utils/constants');

module.exports = _yeoman.Base.extend({
    /**
     * Initializes the generator.
     */
    constructor: function() {
        _yeoman.Base.apply(this, arguments);
        this.availableLambdas = null;
    },

    /**
     * Shows a the title of the sub generator, and a brief description.
     */
    showTitle: function() {
        this.log(_consts.SEPARATOR);
        this.log('Create an Authorizer to authorize API gateway requests:');
        this.log();
    },

    /**
     * Queries the project to identify all defined lambda functions that can
     * serve as custom authorizer handlers.
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
     * Gathers authorizer information
     */
    gatherAuthorizerInfo: function () {
        this.props = this.props || {};
        const prompts = [{
            type: 'input',
            name: 'apiAuthorizerName',
            message: 'Authorizer name?',
            default: 'default_authorizer',
            filter: (response) => {
                const suffix = response.endsWith('_authorizer')?'':'_authorizer';
                return `${response}${suffix}`;
            },
            validate: (response) => {
                const pattern = /^[a-zA-Z0-9_]+$/;
                if(response.match(pattern)) {
                    return true;
                }
                return 'Authorizer names must be non empty and can only contain numbers, letters, and "_"';
            }
        }, {
            type: 'list',
            name: 'apiAuthorizerType',
            message: 'Authorizer type?',
            choices: ['COGNITO', 'CUSTOM'],
            default: 0,
            validate: (response) => {
                if(response === 'CUSTOM' && (!this.availableLambdas ||
                    this.availableLambdas.length <= 0)) {
                    return 'This project has no lambdas that can provide custom authorization functionality';
                }
                return true;
            }
        }, {
            type: 'list',
            name: 'apiAuthorizerLambda',
            message: 'Handler lambda?',
            when: answers => answers.apiAuthorizerType === 'CUSTOM',
            choices: this.availableLambdas,
            default: 0
        }];

        return _prompts.getProjectInfo(this, false)
            .then(() => {
                return this.prompt(prompts).then((props) => {
                    this.props = Object.assign(this.props || {}, props);
                });
            });
    },

    /**
     * Generates target file names.
     */
    generateTargetFileNames: function() {
        this.props.apiAuthorizerFile = _decamelize(this.props.apiAuthorizerName)
                                            .replace(/_/g, '-');
    },

    /**
     * Creates cloud formation template for the api authorizer
     */
    createAuthorizerTemplate: function() {
        this.fs.copyTpl(
            this.templatePath(`resources/api/authorizer.js`),
            this.destinationPath(`resources/api/${this.props.apiAuthorizerFile}.js`),
            this.props
        );
    }
});
