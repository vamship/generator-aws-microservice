'use strict';

const Generator = require('yeoman-generator');
const _prompts = require('../../utils/prompts');
const _decamelize = require('decamelize');

const _consts = require('../../utils/constants');

module.exports = class extends Generator {
    /**
     * Initializes the generator.
     */
    constructor(args, opts) {
        super(args, opts);
    }

    /**
     * Shows a the title of the sub generator, and a brief description.
     */
    showTitle() {
        this.log(_consts.SEPARATOR);
        const title = this.options.title || 'Create a new IAM Role:';
        this.log(title);
        if(this.options.roleName) {
            this.log(` Role name: ${this.options.roleName}`);
        }
        this.log();
    }

   /**
    * Gathers role information
    */
    gatherRoleInfo() {
        this.props = this.props || {};
        this.props.roleName = this.options.roleName;
        this.props.roleAssumedBy = this.options.roleAssumedBy;
        const prompts = [];
        if(!this.props.roleName) {
            prompts.push({
                type: 'input',
                name: 'roleName',
                message: 'Role name?',
                default: `default_lambda_role`,
                filter: (response) => {
                    const suffix = response.endsWith('_role')?'':'_role';
                    return `${response}${suffix}`;
                },
                validate: (response) => {
                    const pattern = /^[a-zA-Z0-9_]+$/;
                    if(response.match(pattern)) {
                        return true;
                    }
                    return 'Role names must be non empty and can only contain numbers, letters, and "_"';
                }
            });
        }

        if(!this.props.roleAssumedBy) {
            prompts.push({
                type: 'list',
                name: 'roleAssumedBy',
                message: 'Role Assumed By?',
                choices: ['LAMBDA', 'API GATEWAY'],
                default: 0
            });
        }

        prompts.push({
            type: 'checkbox',
            name: 'rolePolicies',
            message: 'Choose one or more policies that apply to the role',
            choices: (answers) => {
                const assumedBy = this.props.roleAssumedBy || answers.roleAssumedBy;
                if(assumedBy === 'LAMBDA') {
                    return [{
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
                    }];
                } else {
                    return [{
                        name: ' S3 Read Only',
                        value: 'S3_READ_ONLY',
                    }, {
                        name: ' S3 Read/Write',
                        value: 'S3_READ_WRITE',
                    }, {
                        name: ' Lambda Invoke',
                        value: 'LAMBDA_INVOKE',
                    }];
                }
            },
            default: []
        });

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
        this.props.roleTemplateFile = _decamelize(this.props.roleName)
                                        .replace(/_/g, '-');
    }

    /**
     * Creates cloud formation template for the lambda role.
     */
    createRoleTemplate() {
        this.fs.copyTpl(
            this.templatePath(`resources/core/iam/role.js`),
            this.destinationPath(`resources/core/iam/${this.props.roleTemplateFile}.js`),
            this.props
        );
    }
};
