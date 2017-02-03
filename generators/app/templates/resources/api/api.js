'use strict';

const ApiGatewayTemplates = require('wysknd-aws-cf-generator').ApiGatewayTemplates;
const RestApiTemplate = ApiGatewayTemplates.RestApiTemplate;

module.exports = (dirInfo) => {
    const apiKey = dirInfo.getRootToken('DEFAULT_API');

    return new RestApiTemplate(apiKey, '<%= apiName %>')
        .setDescription('<%= apiDescription %>');
};
