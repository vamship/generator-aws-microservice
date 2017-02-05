'use strict';

const ApiGatewayTemplates = require('wysknd-aws-cf-generator').ApiGatewayTemplates;
const AuthorizerTemplate = ApiGatewayTemplates.AuthorizerTemplate;

module.exports = (dirInfo) => {
    const authorizerName = '<%= projectPrefix %>-<%= apiAuthorizerName %>';
    const authorizerKey = dirInfo.getNamespacedToken('api_authorizer', authorizerName);

    return (new AuthorizerTemplate(authorizerKey, authorizerName))
        .setRestApiId(dirInfo)
<% if(apiAuthorizerType === 'COGNITO') { -%>
        .addCognitoUserPool('<%% cognito_user_pool_id %%>');
<% } else { -%>
        .setAuthorizerLambda('<%= apiAuthorizerLambda %>');
<% } -%>
};
