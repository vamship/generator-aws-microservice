'use strict';

const _yeoman = require('yeoman-generator');
const _chalk = require('chalk');
const _camelCase = require('camelcase');

const _prompts = require('../../utils/prompts');

module.exports = _yeoman.Base.extend({
   /**
    * Gathers lambda function information.
    */
    gatherLambdaInfo: function () {
        const stripPrefix = (functionName) => {
            const prefix = this.props.projectPrefix;

            if(functionName.indexOf(prefix) === 0) {
                return functionName.replace(`${prefix}-`, '');
            } else {
                return functionName;
            }
        };

        const prompts = [{
            type: 'input',
            name: 'lambdaFunctionName',
            message: 'Lambda function name?',
            default: answer => `${this.props.projectPrefix}-hello_world`
        }, {
            type: 'input',
            name: 'lambdaHandlerName',
            message: 'Lambda handler name?',
            default: (answers) => {
                const handlerName = stripPrefix(answers.lambdaFunctionName);
                return `index.${_camelCase(handlerName)}Handler`
            }
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

                    const handlerFile = stripPrefix(this.props.lambdaFunctionName)
                        .replace(/_/g, '-');

                    this.props.lambdaHandlerFile = `${handlerFile}-handler`;
                    this.props.lambdaSchemaFile = `${handlerFile}-schema`;
                    this.props.lambdaSpecFile = `${handlerFile}-spec`;
                });
            });
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
            functionName: this.props.lambdaFunctionName,
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
     },

    // /**
    //  * Creates the necessary files for the lambda function, but includes no
    //  * schema files.
    //  */
    //  createLambdaFunctionWithoutSchema() {
    //      if(this.props.lambdaHasSchema) {
    //          return;
    //      }
    //      this.fs.copyTpl(
    //          this.templatePath(`src/handlers/handler.js`),
    //          this.destinationPath(`src/handlers/${this.props.lambdaHandlerFile}.js`),
    //          this.props
    //      );
    //      this.fs.copyTpl(
    //          this.templatePath(`test/unit/handlers/handler-spec.js`),
    //          this.destinationPath(`test/unit/handlers/${this.props.lambdaSpecFile}.js`),
    //          this.props
    //      );
    //  }
});
