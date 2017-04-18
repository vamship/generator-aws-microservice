'use strict';

const Generator = require('yeoman-generator');
const _decamelize = require('decamelize');

const _fsUtils = require('../../utils/fs-utils');
const _prompts = require('../../utils/prompts');
const _consts = require('../../utils/constants');

module.exports = class extends Generator {
    /**
     * Initializes the generator.
     */
    constructor(args, opts) {
        super(args, opts);
        this.availableSources = null;
        this.availableLambdas = null;
    }

    /**
     * Shows a the title of the sub generator, and a brief description.
     */
    showTitle() {
        this.log(_consts.SEPARATOR);
        this.log('Trigger an event from a DynamoDB stream:');
        this.log();
    }

    /**
     * Queries the project to identify all defined dynamodb tables that can
     * serve as event sources.
     */
    lookupAvailableSources() {
        const done = this.async();
        const path = this.destinationPath('resources/dev/dynamodb');
        _fsUtils.getFilesInDir(path, (parent, fileName, stats) => {
            if(!stats.isDirectory()) {
                return fileName.replace(/-table.js$/,'').replace(/-/g, '_');
            }
        }).then((results) => {
            this.availableSources = results;
        }).finally(() => {
            done();
        });
    }

    /**
     * Queries the project to identify all defined lambda functions that can
     * serve as event handlers.
     */
    lookupAvailableLambdas() {
        const lambdaConfig = this.fs.readJSON(
            this.destinationPath('src/lambda-config.json'), {
                lambdas: []
            }
        );
        this.availableLambdas = lambdaConfig.lambdas.map((lambda) => {
            return lambda.functionName;
        });
    }

    /**
     * Ensures that there are existing lambdas and sources for the generation of
     * the trigger.
     */
    validateSourceAndLambdas() {
        if(!this.availableSources || this.availableSources.length <= 0) {
            this.env.error('This project does not define any sources that can trigger events');
        }
        if(!this.availableLambdas || this.availableLambdas.length <= 0) {
            this.env.error('This project does not define any lambdas that can handle events');
        }
    }

    /**
     * Gathers trigger information
     */
    gatherTriggerInfo () {
        const prompts = [{
            type: 'list',
            name: 'triggerTableSource',
            message: 'Trigger source?',
            choices: this.availableSources
        }, {
            type: 'list',
            name: 'triggerLambdaFunction',
            message: 'Event handler lambda?',
            choices: (answers) => {
                const prefix = `${this.props.projectPrefix}-`;
                return this.availableLambdas.map((lambda) =>{
                    return lambda.replace(prefix, '');
                });
            }
        }, {
            type: 'list',
            name: 'triggerStartPosition',
            message: 'Stream start position?',
            choices: [ 'TRIM_HORIZON', 'LATEST', 'AT_TIMESTAMP' ],
            default: 1
        }, {
            type: 'input',
            name: 'triggerBatchSize',
            message: 'Batch size?',
            default: 100
        }, {
            type: 'input',
            name: 'triggerName',
            message: 'Trigger name?',
            default: (answers) => {
                return `${answers.triggerTableSource}__${answers.triggerLambdaFunction}`;
            }
        }, {
            type: 'input',
            name: 'triggerDescription',
            message: 'Trigger description?',
            default: (answers) => {
                return `Maps events from ${answers.triggerTableSource} to lambda ${answers.triggerLambdaFunction}`;
            }
        }];

        return _prompts.getProjectInfo(this, false)
            .then(() => {
                return this.prompt(prompts).then((props) => {
                    this.props = Object.assign(this.props || {}, props);
                });
            });
    }

    /**
     * Generates target file names.
     */
    generateTargetFileNames() {
        const templateFile = _decamelize(this.props.triggerName)
                                .replace(/_/g, '-');

        this.props.triggerTemplateFile = `${templateFile}-trigger`;
    }

    /**
     * Creates cloud formation template for the trigger
     */
    createTriggerTemplate() {
        this.props.projectTargetEnvironments.forEach((envStr) => {
            const props = Object.assign({}, this.props, {
                envStr: envStr
            });
            this.fs.copyTpl(
                this.templatePath(`resources/_env/lambda/trigger.js`),
                this.destinationPath(`resources/${envStr}/lambda/${this.props.triggerTemplateFile}.js`),
                props
            );
        });
    }
};
