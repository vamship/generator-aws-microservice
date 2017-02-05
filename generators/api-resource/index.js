'use strict';

const _yeoman = require('yeoman-generator');

const _fsUtils = require('../../utils/fs-utils');
const _consts = require('../../utils/constants');

const EMPTY_RESOURCE = 'EMPTY (Create at parent level)';

module.exports = _yeoman.Base.extend({
    /**
     * Initializes the generator.
     */
    constructor: function() {
        _yeoman.Base.apply(this, arguments);
        this.availableResources = ['/'];
    },

    /**
     * Queries the project to identify all defined resources that can serve as
     * parent resources to a resource.
     */
    lookupAvailableResources: function() {
        const done = this.async();
        const path = this.destinationPath('resources/api');
        _fsUtils.getSubDirectoryPaths(path).then((dirList) => {
            const pathRegex = new RegExp(`${path}/?`);
            this.availableResources = dirList.map(item => item.replace(pathRegex, '/'));
            done();
        }).catch((ex) => {
            this.env.error('Error listing existing API resources');
            done(ex);
        });
    },

    /**
     * Shows a the title of the sub generator, and a brief description.
     */
    showTitle: function() {
        this.log(_consts.SEPARATOR);
        this.log('Create a REST API Resource:\n');
        this.log();
    },

    /**
     * Gathers resource information
     */
    gatherResourceInfo: function () {
        const prompts = [{
            type: 'list',
            name: 'apiParentResource',
            message: 'Choose a parent resource for the new resource',
            choices: this.availableResources,
            default: 0
        }, {
            type: 'input',
            name: 'apiResourcePath',
            message: 'Resource path (ex: user/:userId)?',
            default: EMPTY_RESOURCE,
            filter: resp => resp === EMPTY_RESOURCE? '':resp,
            validate: (response) => {
                const resPattern = /(^[^\/]|^:)((\/:?)?[a-zA-Z0-9]+)+$/;
                if(response === '' || response.match(resPattern)) {
                    return true;
                }
                return 'If non empty, resource name can only contain letters, numbers, "_" and "-".\n   Multiple resources can be separated by "/"\n   Parameterized resource paths should be prefixed with ":"';
            }
        }, {
            type: 'confirm',
            name: 'apiEnableCors',
            message: 'Enable CORS?',
            default: true
        }, {
            type: 'checkbox',
            name: 'apiCorsMethods',
            message: 'CORS methods?',
            choices: ['GET', 'POST', 'PUT', 'DELETE'],
            default: [ 'GET', 'POST' ],
            when: answers => answers.apiEnableCors,
            validate: (response) => {
                if(response.length > 0) {
                    return true;
                }
                return 'Choose at least one applicable HTTP method';
            }
        }];

        return this.prompt(prompts).then((props) => {
            this.props = Object.assign(this.props || {}, props);
        });
    },

    /**
     * Creates cloud formation template for the api resource
     */
    createResourceTemplate: function() {
        let updated = false;
        const resourcePath = this.props.apiResourcePath;
        const resTokens = (resourcePath === EMPTY_RESOURCE)?'':resourcePath;

        let basePath = `resources/api${this.props.apiParentResource}`;
        resTokens.split('/').forEach((resourceName) => {
            const isRoot = (basePath === 'resources/api/');
            const props = Object.assign({}, this.props, {
                isDynamic: resourceName.indexOf(':') === 0,
                isRoot
            });
            resourceName = resourceName.replace(':', '');

            if(resourceName !== '') {
                this.fs.copyTpl(
                    this.templatePath(`resources/api/_resource/resource.js`),
                    this.destinationPath(`${basePath}/${resourceName}/resource.js`),
                    props
                );
                updated = true;
            }
            if(this.props.apiEnableCors) {
                this.fs.copyTpl(
                    this.templatePath(`resources/api/_resource/options.js`),
                    this.destinationPath(`${basePath}/${resourceName}/options.js`),
                    props
                );
                updated = true;
            }

            basePath = basePath + `/${resourceName}`;
        });
        if(!updated) {
            this.log('No updates necessary');
        }
    }
});
