'use strict';

const _yeoman = require('yeoman-generator');
const _chalk = require('chalk');
const _yosay = require('yosay');

const _prompts = require('../../utils/prompts');

module.exports = _yeoman.Base.extend({
   /**
    * Gather basic project information.
    */
    gatherProjectInfo: function () {
        this.log(_yosay(
            'Welcome to the ' + _chalk.red('generator-wysknd-lambda') + ' generator!'
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
     * Create cloud formation templates for basic resources.
     */
    createCloudFormationTemplates: function() {
        return this.composeWith('wysknd-lambda:cf-role', {
            options: {
                projectPrefix: this.props.projectPrefix,
                roleName: 'lambda_role'
            }
        });
    },

    /**
     * Check if the user would like to create a sample lambda function
     */
    checkCreateLambda: function () {
        const prompts = [{
            type: 'confirm',
            name: 'createLambdaFunction',
            message: 'Do you want to create a Lambda function?',
            default: true
        }];

        return this.prompt(prompts).then((props) => {
            this.props = Object.assign(this.props || {}, props);
            if(props.createLambdaFunction === true) {
                return this.composeWith('wysknd-lambda:function');
            }
        });
    }
});
