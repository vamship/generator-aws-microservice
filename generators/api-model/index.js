'use strict';

const _yeoman = require('yeoman-generator');
const _decamelize = require('decamelize');

const _consts = require('../../utils/constants');

module.exports = _yeoman.Base.extend({
    /**
     * Initializes the generator.
     */
    constructor: function() {
        _yeoman.Base.apply(this, arguments);
    },

    /**
     * Shows a the title of the sub generator, and a brief description.
     */
    showTitle: function() {
        this.log(_consts.SEPARATOR);
        this.log('Create a model for a REST request/response:\n');
    },

    /**
     * Gathers model information
     */
    gatherModelInfo: function () {
        const prompts = [{
            type: 'input',
            name: 'apiModelName',
            message: 'Model Name (ex: CreateUserRequest)?',
            validate: (response) => {
                const pattern = /^[a-zA-Z0-9]+$/;
                if(response.match(pattern)) {
                    return true;
                }
                return 'A valid model name must be specified';
            }
        }, {
            type: 'input',
            name: 'apiModelDescription',
            message: 'Model Description?',
        }];

        return this.prompt(prompts).then((props) => {
            this.props = Object.assign(this.props || {}, props);
        });
    },

    /**
     * Generates target file names.
     */
    generateTargetFileNames: function() {
        const templateFile = _decamelize(this.props.apiModelName)
                                .replace(/_/g, '-');

        this.props.modelTemplateFile = `${templateFile}-model`;
    },

    /**
     * Creates cloud formation template for the api model
     */
    createModelTemplate: function() {
        this.fs.copyTpl(
            this.templatePath(`resources/api/_models/model.js`),
            this.destinationPath(`resources/api/_models/${this.props.modelTemplateFile}.js`),
            this.props
        );
    },

    /**
     * Finish up and show user messae.
     */
    finish() {
        this.log('A new model file will be created. You will have to update the model with the appropriate JSON schema');
    }
});
