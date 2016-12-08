'use strict';
<%if (lambdaHasSchema) { %>
const _schemaHelper = require('wysknd-args').schemaHelper;

const _schema = require('../schema/<%= lambdaSchemaFile %>');
const _checkSchema = _schemaHelper.buildSchemaChecker(_schema);
<%} %>
/**
 * <%= lambdaDescription %>
 *
 * @param {Object} event The lambda event object
 * @param {Object} context The lambda context object
 * @param {Function} callback A callback method to signal the completion
 *          lambda function
 * @param {Object} ext Extended properties containing references to injected
 *        properties such as config, logger, etc.
 */
module.exports = function(event, context, callback, ext) {
    const logger = ext.logger;
    const config = ext.config;
<%if (lambdaHasSchema) {%>
    let error = _checkSchema(event, callback);

    if (error) {
        logger.error(error);
        callback(error);
        return;
    }
<%} %>
    //TODO: Implement function and invoke callback.
    callback(null, 'Lambda function [<%= lambdaFunctionName %>] executed successfully');
};
