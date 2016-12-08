'use strict';

const _yeoman = require('yeoman-generator');
const _prompts = require('../../utils/prompts');
const _decamelize = require('decamelize');

const _consts = require('../../utils/constants');

module.exports = _yeoman.Base.extend({
    /**
     * Initializes the generator.
     */
    constructor: function() {
        _yeoman.Base.apply(this, arguments);

        this._gatherIndexInfo = (isGlobal) => {
            isGlobal = !!isGlobal;
            const indexType = !isGlobal? 'local':'global';
            const prompts = [{
                type: 'confirm',
                name: 'tableIndexCreate',
                message: `Create ${indexType} secondary index?`,
                default: true
            }, {
                type: 'input',
                name: 'tableIndexHashKey',
                message: 'Index hash key?',
                default: 'hashKey',
                when: (answers) => answers.tableIndexCreate
            }, {
                type: 'list',
                choices: [ 'N', 'S', 'B' ],
                name: 'tableIndexHashKeyType',
                message: 'Index hash key type?',
                default: 'S',
                when: (answers) => answers.tableIndexCreate
            }, {
                type: 'input',
                name: 'tableIndexRangeKey',
                message: 'Index range key? (leave empty if not required)',
                when: (answers) => answers.tableIndexCreate
            }, {
                type: 'list',
                choices: [ 'N', 'S', 'B' ],
                name: 'tableIndexRangeKeyType',
                message: 'Index range key type?',
                default: 'S',
                when: (answers) => answers.tableIndexCreate &&
                                            !!answers.tableIndexRangeKey
            }, {
                type: 'list',
                choices: [ 'KEYS_ONLY', 'INCLUDE', 'ALL' ],
                name: 'tableIndexProjectionType',
                message: 'Projection type?',
                default: 'KEYS_ONLY',
                when: (answers) => answers.tableIndexCreate
            }, {
                type: 'input',
                name: 'tableIndexProjectionAttributes',
                message: 'Projection attributes? (comma separated)',
                when: (answers) => answers.tableIndexCreate &&
                                    answers.tableIndexProjectionType === 'INCLUDE'
            }, {
                type: 'input',
                name: 'tableIndexName',
                message: 'Index name?',
                default: (answers) => {
                    const rangeToken = !!(answers.tableIndexRangeKey)? `${answers.tableIndexRangeKey}-`:'';
                    return `${answers.tableIndexHashKey}-${rangeToken}index`;
                },
                when: (answers) => answers.tableIndexCreate
            }, {
                type: 'input',
                name: 'tableIndexReadCapacity',
                message: 'Index read capacity?',
                default: 5,
                when: (answers) => answers.tableIndexCreate && isGlobal
            }, {
                type: 'input',
                name: 'tableIndexWriteCapacity',
                message: 'Index write capacity?',
                default: 5,
                when: (answers) => answers.tableIndexCreate && isGlobal
            }];

            return this.prompt(prompts).then((props) => {
                this.props = this.props || {};
                this.props.tableIndexMap = this.props.tableIndexMap || {};

                const indexMap = this.props.tableIndexMap;
                if(props.tableIndexCreate) {
                    const indexInfo = {
                        name: props.tableIndexName,
                        isGlobalIndex: isGlobal,
                        hashKey: props.tableIndexHashKey,
                        hashKeyType: props.tableIndexHashKeyType,
                        rangeKey: props.tableIndexRangeKey,
                        rangeKeyType: props.tableIndexRangeKeyType,
                        projectionType: props.tableIndexProjectionType,
                        readCapacity: props.tableIndexReadCapacity,
                        writeCapacity: props.tableIndexWriteCapacity,
                        projectionAttributes: []
                    };
                    const attrs = props.tableIndexProjectionAttributes;
                    if(typeof attrs === 'string' && attrs.length > 0) {
                        indexInfo.projectionAttributes = attrs.split(',').map((attr) => {
                            return attr.trim();
                        });
                    }
                    indexMap[props.tableIndexName] = indexInfo;
                    this.log(`\nGot it. You can create more ${indexType} secondary indexes if you like.`);
                    return true;
                }
                return false;
            });
        };
    },

    /**
     * Shows a the title of the sub generator, and a brief description.
     */
    showTitle: function() {
        this.log(_consts.SEPARATOR);
        this.log('Create DynamoDB table:\n');
    },

   /**
    * Gathers basic table information
    */
    gatherTableInfo: function () {
        const prompts = [{
            type: 'checkbox',
            name: 'tableTargetEnvironments',
            message: 'Select target environments',
            choices: [ 'dev', 'prod' ],
            default: [ 'dev', 'prod' ]
        }, {
            type: 'input',
            name: 'tableName',
            message: 'Table name?',
            default: 'lambda-data-store'
        }, {
            type: 'input',
            name: 'tableReadCapacity',
            message: 'Table read capacity?',
            default: 5
        }, {
            type: 'input',
            name: 'tableWriteCapacity',
            message: 'Table write capacity?',
            default: 5
        }, {
            type: 'input',
            name: 'tableHashKey',
            message: 'Table hash key?',
            default: 'hashKey'
        }, {
            type: 'list',
            choices: [ 'N', 'S', 'B' ],
            name: 'tableHashKeyType',
            message: 'Table hash key type?',
            default: 'S'
        }, {
            type: 'input',
            name: 'tableRangeKey',
            message: 'Table range key? (leave empty if not required)'
        }, {
            type: 'list',
            choices: [ 'N', 'S', 'B' ],
            name: 'tableRangeKeyType',
            message: 'Table range key type?',
            default: 'S',
            when: (answers) => !!answers.tableRangeKey
        }];

        return _prompts.getProjectInfo(this, false)
            .then(() => {
                return this.prompt(prompts).then((props) => {
                    this.props = Object.assign(this.props || {}, props);
                    this.log(_consts.SEPARATOR);
                });
            });
    },

   /**
    * Gathers local secondary index info
    */
    gatherLSIInfo: function () {
        return this._gatherIndexInfo(false).then((repeat) => {
            if(repeat) {
                return this.gatherLSIInfo();
            }
            this.log(_consts.SEPARATOR);
        });
    },

   /**
    * Gathers global secondary index info
    */
    gatherGSIInfo: function () {
        return this._gatherIndexInfo(true).then((repeat) => {
            if(repeat) {
                return this.gatherGSIInfo();
            }
        });
    },

    /**
     * Generates target file names.
     */
    generateTargetFileNames: function() {
        const templateFile = _decamelize(this.props.tableName)
                                .replace(/_/g, '-');

        this.props.tableTemplateFile = `${templateFile}-table`;
    },

    /**
     * Creates cloud formation template for the dynamo db table.
     */
    createTableTemplate: function() {
        this.fs.copyTpl(
            this.templatePath(`resources/cf/dynamodb/table.js`),
            this.destinationPath(`resources/cf/dynamodb/${this.props.tableTemplateFile}.js`),
            this.props
        );
    }
});
