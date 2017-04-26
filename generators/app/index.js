'use strict';

const Generator = require('yeoman-generator');
const _chalk = require('chalk');
const _yosay = require('yosay');

const _prompts = require('../../utils/prompts');
const _consts = require('../../utils/constants');
const _package = require('../../package.json');

module.exports = class extends Generator {
    /**
     * Initializes the generator.
     */
    constructor(args, opts) {
        super(args, opts);
    }

   /**
    * Gather basic project information.
    */
    gatherProjectInfo() {
        const generatorTitle = `${_consts.GENERATOR_NAME} v${_package.version}`;
        this.log(_yosay(
            `AWS Microservice Generator.\n${_chalk.red(generatorTitle)} `
        ));
        return _prompts.getProjectInfo(this, true)
            .then(() => {
                this.log(_consts.SEPARATOR);
                const modifiedProjectName = this.props.projectName
                                                .replace(this.props.projectPrefix + '-', '')
                                                .replace(/-/g, ' ');
                const prompts = [{
                    type: 'input',
                    name: 'apiName',
                    message: 'API name?',
                    default: answers => `${modifiedProjectName} API`
                }, {
                    type: 'input',
                    name: 'apiDescription',
                    message: 'API description?',
                    default: answers => `API for the ${modifiedProjectName} microservice`
                }];
                return this.prompt(prompts).then((props) => {
                    this.log(_consts.SEPARATOR);
                    this.props = Object.assign(this.props || {}, props);
                });
             }).then(() => { return _prompts.getAuthorInfo(this, true); })
            .then(() => { return _prompts.getAwsInfo(this, true); });
    }

    /**
     * Creates project files
     */
    createProjectFiles() {
        [
            'package.json',
            'Gruntfile.js',
            'buildspec.yml',
            'README.md',
            '_gitignore',
            '_npmignore',
            '_projections.json',
            '_eslintrc.json',
            '_esformatter',
            'config/default.json',
            'config/e2e.json',
            'config/dev.json',
            'config/prod.json',
            'config/custom-environment-variables.json',
            'resources/core/lambda/lambda-functions.js',
            'resources/api/api.js',
            'src/lambda-config.json',
            'src/index.js',
            'test/unit/index-spec.js'
        ].forEach((srcFile) => {
            const destFile = (srcFile.indexOf('_') === 0) ?
                                        srcFile.replace('_', '.'): srcFile;
            this.fs.copyTpl(
                this.templatePath(srcFile),
                this.destinationPath(destFile),
                this.props
            );
        });
    }

    /**
     * Finish the rest of the main flow by composing sub generators.
     */
    compose() {
        this.composeWith(`${_consts.GENERATOR_NAME}:${_consts.SUB_GEN_LAMBDA}`);
        this.composeWith(`${_consts.GENERATOR_NAME}:${_consts.SUB_GEN_ROLE}`, {
            title: 'Create a new role for lambda functions',
            projectPrefix: this.props.projectPrefix,
            roleName: 'lambda_role',
            roleAssumedBy: 'LAMBDA'
        });
        this.composeWith(`${_consts.GENERATOR_NAME}:${_consts.SUB_GEN_ROLE}`, {
            title: 'Create a new role for the API gateway',
            projectPrefix: this.props.projectPrefix,
            roleName: 'api_gateway_role',
            roleAssumedBy: 'API GATEWAY'
        });
        // this.composeWith(`${_consts.GENERATOR_NAME}:${_consts.SUB_GEN_TABLE}`);
        this.composeWith(`${_consts.GENERATOR_NAME}:${_consts.SUB_GEN_FINISH}`);
    }
};
