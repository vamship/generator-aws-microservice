'use strict';

const ApiGatewayTemplates = require('wysknd-aws-cf-generator').ApiGatewayTemplates;
const MethodTemplate = ApiGatewayTemplates.MethodTemplate;
const _mappingHelper = ApiGatewayTemplates.mappingTemplateHelper;

module.exports = (dirInfo) => {
    const method = 'GET';
    const methodKey = dirInfo.getToken(method);
<% if(apiMethodRequestModelName.length > 0) { -%>
    const requestModel = '<%= apiMethodRequestModelName %>';
    const requestModelKey = dirInfo.getNamespacedToken('api_model', requestModel);
<% } -%>
<% if(apiMethodResponseModelName.length > 0) { -%>
    const responseModel = '<%= apiMethodResponseModelName %>';
    const responseModelKey = dirInfo.getNamespacedToken('api_model', responseModel);
<% } -%>

<% if(apiMethodAuthorizer === 'NONE') { -%>
    const authorizerId = false;
    const authorizerType = null;
<% } else { -%>
    const authorizerId = dirInfo.getNamespacedToken('api_authorizer', '<%= apiMethodAuthorizer %>');
    const authorizerType = '<%= apiMethodAuthorizerType %>';
<% } -%>

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

    //TODO: This request template must be filled out with an appropriate mapping
    //of the HTTP response to the response  required by teh caller
    const responseTemplate = `$input.json('$')`;

    return (new MethodTemplate(methodKey))
        .setRestApiId(dirInfo)
<% if(apiMethodResource !== '/') { -%>
        .setResource(dirInfo)
<% } -%>
        .setHttpMethod(method)
        .setAuthorizer(`<%% ${authorizerId} %%>`, authorizerType)
<% if(apiMethodBackendType === 'MOCK') { -%>
        .setMockBackend()
<% } else if(apiMethodBackendType === 'LAMBDA') { -%>
        .setBackendLambda('<%= apiMethodLambda %>')
<% } -%>
<% if(apiMethodAuthorizer !== 'NONE') { -%>
        .setRequestHeader('Authorization', true)
<% } -%>
        .setRequestTemplate(requestTemplate, 'application/json')
<% if(apiMethodRequestModelName.length > 0) { -%>
        .setRequestModel(requestModel)
<% } else { -%>
        .setRequestModel('Empty')
<% } -%>
        .setDefaultIntegrationResponses()
<% if(typeof apiMethodEnableCors) { -%>
        .setResponseHeader('Access-Control-Allow-Origin', '<%% cors_origin %%>')
<% } -%>
        .setResponseTemplate(responseTemplate, 'application/json', '200')
<% if(apiMethodResponseModelName.length > 0) { -%>
        .setResponseModel(responseModel, 'application/json', '200')
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
