'use strict';

const ApiGatewayTemplates = require('wysknd-aws-cf-generator').ApiGatewayTemplates;
const MethodTemplate = ApiGatewayTemplates.MethodTemplate;
const _mappingHelper = ApiGatewayTemplates.mappingTemplateHelper;

module.exports = (dirInfo) => {
    const method = '<%= apiMethodVerb %>';
    const methodKey = dirInfo.getToken(method);
<% if(apiMethodRequestModelName.length > 0) { -%>
    const requestModel = '<%= apiMethodRequestModelName %>';
    const requestModelKey = dirInfo.getNamespacedToken('api_model', requestModel);
<% } -%>
<% if(apiMethodResponseModelName.length > 0) { -%>
    const responseModel = '<%= apiMethodResponseModelName %>';
    const responseModelKey = dirInfo.getNamespacedToken('api_model', responseModel);
<% } -%>
<% if(apiMethodAuthorizer !== 'NONE') { -%>

    const authorizerId = dirInfo.getNamespacedToken('api_authorizer', '<%= apiMethodAuthorizer %>');
    const authorizerType = '<%= apiMethodAuthorizerType %>';
<% } -%>
<% if(apiMethodBackendType !== 'S3') { -%>

    //TODO: This request template must be filled out with an appropriate mapping
    //of the HTTP request to the parameters required by the back end.
    const requestTemplate = `{
<% if(apiMethodAuthorizer !== 'NONE') { -%>
${_mappingHelper.mapUserFromJwt({
        username: 'email',
        accountId: 'custom:accountId',
        roles: {
            value: 'custom:roles',
            noQuotes: true
        }
    })}
<% } -%>
}`;
<% } -%>

    //TODO: This request template must be filled out with an appropriate mapping
    //of the HTTP response to the response  required by teh caller
    const responseTemplate = `$input.json('$')`;

    return (new MethodTemplate(methodKey))
        .setRestApiId(dirInfo)
<% if(apiMethodResource !== '/') { -%>
        .setResource(dirInfo)
<% } -%>
        .setHttpMethod(method)
<% if(apiMethodAuthorizer === 'NONE') { -%>
        .setAuthorizer(false)
<% } else { -%>
        .setAuthorizer(`<%% ${authorizerId} %%>`, authorizerType)
<% } -%>
<% if(apiMethodBackendType === 'MOCK') { -%>
        .setMockBackend()
<% } else if(apiMethodBackendType === 'LAMBDA') { -%>
        .setBackendLambda('<%= apiMethodLambda %>')
<% } else if(apiMethodBackendType === 'S3') { -%>
        .setBackendS3('<%= apiMethodS3Path %>', method)
<% apiMethodS3Path.split('/')
    .filter(token => /{[a-zA-Z0-9\._-]+}/.test(token))
    .map(token => token.substring(1, token.length - 1))
    .forEach((token) => { -%>
        .mapBackEndRequestPath('<%= token %>', '<%= token %>')
<% }) -%>
<% } -%>
<% if(apiMethodResource !== '/') { -%>
        // .setRequestPath('userId', true) //TODO: Add references to dynamic path elements (ex: /users/{userId})
<% } -%>
<% if(apiMethodAuthorizer !== 'NONE') { -%>
        .setRequestHeader('Authorization', true)
<% } -%>
<% if(apiMethodBackendType !== 'S3') { -%>
        .setRequestTemplate(requestTemplate, 'application/json')
<% } -%>
<% if(apiMethodRequestModelName.length > 0) { -%>
        .setRequestModel(requestModel)
<% } else { -%>
        .setRequestModel('Empty')
<% } -%>
<% if(apiMethodBackendType === 'S3') { -%>
        .setBinaryIntegrationResponses()
<% } else { -%>
        .setDefaultIntegrationResponses()
<% } -%>
<% if(typeof apiMethodEnableCors) { -%>
        .setResponseHeader('Access-Control-Allow-Origin', '<%% cors_origin %%>')
<% } -%>
<% if(apiMethodBackendType !== 'S3') { -%>
        .setResponseTemplate(responseTemplate, 'application/json', '200')
<% } -%>
<% if(apiMethodResponseModelName.length > 0) { -%>
        .setResponseModel(responseModel, 'application/json', '200')
<% } else if(apiMethodBackendType === 'S3') { -%>
        .setResponseModel('Empty', 'application/octet-stream', '200')
<% } else { -%>
        .setResponseModel('Empty', 'application/json', '200')
<% } -%>
<% if(apiMethodAuthorizer !== 'NONE') { -%>
        .addDependency(authorizerId)
<% } -%>
<% if(apiMethodResponseModelName.length > 0) { -%>
        .addDependency(responseModelKey)
<% } -%>
<% if(apiMethodRequestModelName.length > 0) { -%>
        .addDependency(requestModelKey)
<% } -%>
        ;
};
