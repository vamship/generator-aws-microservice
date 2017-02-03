'use strict';

const ApiGatewayTemplates = require('wysknd-aws-cf-generator').ApiGatewayTemplates;
const MethodTemplate = ApiGatewayTemplates.MethodTemplate;

module.exports = (dirInfo) => {
    const method = 'OPTIONS';
    const methodKey = dirInfo.getToken(method);
    const requestTemplate = `{ "statusCode": 200 }`;
    const responseTemplate = `$input.json('$')`;

    return (new MethodTemplate(methodKey))
        .setRestApiId(dirInfo)
<% if(typeof apiResourceName !== '[ROOT RESOURCE]') { -%>
        .setResource(dirInfo)
<% } -%>
        .setHttpMethod(method)
        .setAuthorizer(false)
        .setMockBackend()
        .setRequestTemplate(requestTemplate, 'application/json')
        .setDefaultIntegrationResponses()
        .setResponseHeader('Access-Control-Allow-Origin', '<%% cors_origin %%>')
        .setResponseHeader('Access-Control-Allow-Methods', '\'<%- apiCorsMethods.map(item => `${item}`).join(", ") %>\'')
        .setResponseHeader('Access-Control-Allow-Headers', '\'Authorization,Content-Type\'')
        .setResponseTemplate(responseTemplate, 'application/json', '200')
        .setResponseModel('Empty', 'application/json', '200');
};
