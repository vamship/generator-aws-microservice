'use strict';

const _yeoman = require('yeoman-generator');
const _chalk = require('chalk');
const _yosay = require('yosay');

const _prompts = require('../../utils/prompts');
const _consts = require('../../utils/constants');

module.exports = _yeoman.Base.extend({
   /**
    * Gather basic project information.
    */
    gatherProjectInfo: function () {
        this.log(_yosay(
            `Welcome to the ${_chalk.red(_consts.GENERATOR_NAME)} generator!`
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
            'lambda-config.json',
            '_gitignore',
            '_npmignore',
            '_projections.json',
            'config/default.json',
            'config/dev.json',
            'config/prod.json',
            'config/custom-environment-variables.json',
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
                roleName: 'lambda_role'
            }
        });
        // this.composeWith(`${_consts.GENERATOR_NAME}:${_consts.SUB_GEN_TABLE}`);
        this.composeWith(`${_consts.GENERATOR_NAME}:${_consts.SUB_GEN_FINISH}`);
    }
});
