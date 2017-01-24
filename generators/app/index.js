'use strict';

const _yeoman = require('yeoman-generator');
const _chalk = require('chalk');
const _yosay = require('yosay');

const _prompts = require('../../utils/prompts');
const _consts = require('../../utils/constants');
const _package = require('../../package.json');

module.exports = _yeoman.Base.extend({
   /**
    * Gather basic project information.
    */
    gatherProjectInfo: function () {
        const generatorTitle = `${_consts.GENERATOR_NAME} v${_package.version}`;
        this.log(_yosay(
            `AWS Microservice Generator.\n${_chalk.red(generatorTitle)} `
        ));
        return _prompts.getProjectInfo(this, true)
            .then(() => { return _prompts.getAuthorInfo(this, true) })
            .then(() => { return _prompts.getAwsInfo(this, true) });
    },

    /**
     * Creates project files
     */
    createProjectFiles: function () {
        [
            'package.json',
            'Gruntfile.js',
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
            'resources/common/lambda/lambda-functions.js',
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
    },

    /**
     * Finish the rest of the main flow by composing sub generators.
     */
    compose: function () {
        this.composeWith(`${_consts.GENERATOR_NAME}:${_consts.SUB_GEN_LAMBDA}`);
        this.composeWith(`${_consts.GENERATOR_NAME}:${_consts.SUB_GEN_ROLE}`, {
            options: {
                projectPrefix: this.props.projectPrefix,
                roleName: 'default_lambda_role'
            }
        });
        // this.composeWith(`${_consts.GENERATOR_NAME}:${_consts.SUB_GEN_TABLE}`);
        this.composeWith(`${_consts.GENERATOR_NAME}:${_consts.SUB_GEN_FINISH}`);
    }
});
