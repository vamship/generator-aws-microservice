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
                this.composeWith('wysknd-lambda:lambda');
            }
        });
    },

    /**
     * Copies core project files
     */
    copyFiles: function () {
        this.fs.copyTpl(
            this.templatePath('package.json'),
            this.destinationPath('package.json'),
            this.props
        );
        this.fs.copyTpl(
            this.templatePath('Gruntfile.js'),
            this.destinationPath('Gruntfile.js'),
            this.props
        );
        this.fs.writeJSON(
            this.destinationPath('resources/lambda-config.json'),
            { lambdas: [ ] },
            null,
            4
        );
    },

   //  install: function () {
   //      //this.installDependencies();
   //  }
});
