'use strict';

const ApiGatewayTemplates = require('wysknd-aws-cf-generator').ApiGatewayTemplates;
const ModelTemplate = ApiGatewayTemplates.ModelTemplate;

module.exports = (dirInfo) => {
    const modelName = '<%= apiModelName %>';
    const modelKey = dirInfo.getNamespacedToken('api_model', modelName);

    return new ModelTemplate(modelKey, modelName)
        .setRestApiId(dirInfo)
        .setDescription('<%= apiModelDescription %>')
        .setSchema({
            // TODO: Update model schema as necessary. For more information on
            // defining schemas, please see: http://json-schema.org/examples.html
            type: 'object',
            properties: {
                status: {
                    type: 'string',
                    enum: ['ok']
                }
            },
            required: ['status']
        });
};
