'use strict';

const _yeoman = require('yeoman-generator');
const _prompts = require('../../utils/prompts');
const _decamelize = require('decamelize');

module.exports = _yeoman.Base.extend({
   /**
    * Gathers role information
    */
    gatherRoleInfo: function () {
        this.props = this.props || {};
        this.props.roleName = this.options.roleName;
        this.props.projectPrefix = this.options.projectPrefix;
        const prompts = [];
        if(!this.props.roleName) {
            prompts.push({
                type: 'input',
                name: 'roleName',
                message: 'Role name?',
                default: `lambda_role`
            });
        }
        prompts.push({
            type: 'checkbox',
            name: 'rolePolicies',
            message: 'Choose one or more policies that apply to the role',
            choices: [
                ' All AWS Services (Be careful with this one ..)',
                ' DynamoDb Read Only',
                ' DynamoDb Read/Write',
                ' S3 Read Only',
                ' S3 Read/Write',
                ' Lambda Invoke',
                ' Kinesis Read Only'
            ],
            default: []
        });

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
        const templateFile = _decamelize(this.props.roleName)
                                .replace(/_/g, '-');

        this.props.roleTemplateFile = `${templateFile}`;
    },

    /**
     * Creates cloud formation template for the lambda role.
     */
    createRoleTemplate: function() {
        this.fs.copyTpl(
            this.templatePath(`resources/cf/iam/lambda-role.js`),
            this.destinationPath(`resources/cf/iam/${this.props.roleTemplateFile}.js`),
            this.props
        );
    }
});
