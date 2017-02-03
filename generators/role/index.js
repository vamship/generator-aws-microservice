'use strict';

const _yeoman = require('yeoman-generator');
const _prompts = require('../../utils/prompts');
const _decamelize = require('decamelize');

const _consts = require('../../utils/constants');

module.exports = _yeoman.Base.extend({
    /**
     * Shows a the title of the sub generator, and a brief description.
     */
    showTitle: function() {
        this.log(_consts.SEPARATOR);
        this.log('Create IAM role for lambda functions:');
        if(this.options.roleName) {
            this.log(` Role name: ${this.options.roleName}\n`);
        } else {
            this.log();
        }
    },

   /**
    * Gathers role information
    */
    gatherRoleInfo: function () {
        this.log(_consts.SEPARATOR);
        this.props = this.props || {};
        this.props.roleName = this.options.roleName;
        const prompts = [];
        if(!this.props.roleName) {
            prompts.push({
                type: 'input',
                name: 'roleName',
                message: 'Role name?',
                default: `default_lambda_role`
            });
        }
        prompts.push({
            type: 'checkbox',
            name: 'rolePolicies',
            message: 'Choose one or more policies that apply to the role',
            choices: [ {
                name: ' All AWS Services (Be careful with this one ..)',
                value: 'ALL_ACCESS',
            }, {
                name: ' DynamoDb Read Only',
                value: 'DYNAMO_READ_ONLY',
            }, {
                name: ' DynamoDb Read/Write',
                value: 'DYNAMO_READ_WRITE',
            }, {
                name: ' S3 Read Only',
                value: 'S3_READ_ONLY',
            }, {
                name: ' S3 Read/Write',
                value: 'S3_READ_WRITE',
            }, {
                name: ' Lambda Invoke',
                value: 'LAMBDA_INVOKE',
            }, {
                name: ' Kinesis Read Only',
                value: 'KINESIS_READ_ONLY'
            }],
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
        const roleSuffix = templateFile.endsWith('-role')?'':'-role';

        this.props.roleTemplateFile = `${templateFile}${roleSuffix}`;
    },

    /**
     * Creates cloud formation template for the lambda role.
     */
    createRoleTemplate: function() {
        this.fs.copyTpl(
            this.templatePath(`resources/core/iam/lambda-role.js`),
            this.destinationPath(`resources/core/iam/${this.props.roleTemplateFile}.js`),
            this.props
        );
    }
});
