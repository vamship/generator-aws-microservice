'use strict';

const _yeoman = require('yeoman-generator');
const _camelCase = require('camelcase');
const _decamelize = require('decamelize');

const _prompts = require('../../utils/prompts');
const _consts = require('../../utils/constants');

module.exports = _yeoman.Base.extend({
    /**
     * Initializes the generator.
     */
    constructor: function() {
        _yeoman.Base.apply(this, arguments);
    },

    /**
     * Shows a the title of the sub generator, and a brief description.
     */
    showTitle: function() {
        this.log(_consts.SEPARATOR);
        this.log('Create lambda function handler:\n');
    },

    /**
     * Gathers lambda function information.
     */
    gatherLambdaInfo: function () {
        const prompts = [{
            type: 'input',
            name: 'lambdaFunctionName',
            message: 'Lambda function name?',
            default: answer => `hello_world`
        }, {
            type: 'input',
            name: 'lambdaHandlerName',
            message: 'Lambda handler name?',
            default: answers => `index.${_camelCase(answers.lambdaFunctionName)}Handler`
        }, {
            type: 'input',
            name: 'lambdaDescription',
            message: 'Lambda function description?',
            default: 'sample lambda function'
        }, {
            type: 'input',
            name: 'lambdaMemory',
            message: 'Memory allocation?',
            default: 128
        }, {
            type: 'input',
            name: 'lambdaTimeout',
            message: 'Lambda timeout?',
            default: 3
        }, {
            type: 'confirm',
            name: 'lambdaHasSchema',
            message: 'Does the function require schema validation?'
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
        const handlerFile = _decamelize(this.props.lambdaFunctionName)
                                .replace(/_/g, '-');

        this.props.lambdaHandlerFile = `${handlerFile}-handler`;
        this.props.lambdaSchemaFile = `${handlerFile}-schema`;
        this.props.lambdaSpecFile = `${handlerFile}-handler-spec`;
    },

    /**
     * Creates the definition for a lambda function.
     */
     createLambdaDefinition: function() {
        const lambdaConfig = this.fs.readJSON(
            this.destinationPath('lambda-config.json'), {
                lambdas: []
            }
        );
        const lambdaDefinition = {
            functionName: `${this.props.projectPrefix}-${this.props.lambdaFunctionName}`,
            handlerName: this.props.lambdaHandlerName,
            fileName: this.props.lambdaHandlerFile
        };

        if(this.props.lambdaDescription) {
            lambdaDefinition.description = this.props.lambdaDescription;
        }
        if(this.props.lambdaMemory) {
            lambdaDefinition.memory = this.props.lambdaMemory;
        }
        if(this.props.lambdaTimeout) {
            lambdaDefinition.timeout = this.props.lambdaTimeout;
        }

        const definitionExists = lambdaConfig.lambdas.find((definition) => {
            return definition.functionName === lambdaDefinition.functionName;
        });

        if(definitionExists) {
            const error = `Lambda function definition already exists: [${lambdaDefinition.functionName}]`;
            this.env.error(error);
            return;
        }

        lambdaConfig.lambdas.push(lambdaDefinition);
        this.fs.writeJSON(
            this.destinationPath('lambda-config.json'),
            lambdaConfig,
            null,
            4
        );
     },

    /**
     * Creates the necessary files for the lambda function including a
     * schema definition.
     */
     createLambdaFunctionWithSchema() {
         if(this.props.lambdaHasSchema) {
             this.fs.copyTpl(
                 this.templatePath(`src/schema/handler-schema.json`),
                 this.destinationPath(`src/schema/${this.props.lambdaSchemaFile}.json`),
                 this.props
             );
         }
         this.fs.copyTpl(
             this.templatePath(`src/handlers/handler.js`),
             this.destinationPath(`src/handlers/${this.props.lambdaHandlerFile}.js`),
             this.props
         );
         this.fs.copyTpl(
             this.templatePath(`test/unit/handlers/handler-spec.js`),
             this.destinationPath(`test/unit/handlers/${this.props.lambdaSpecFile}.js`),
             this.props
         );
     }
});
