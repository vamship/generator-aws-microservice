'use strict';

const LambdaTemplates = require('wysknd-aws-cf-generator').LambdaTemplates;
const PermissionTemplate = LambdaTemplates.PermissionTemplate;

/**
 * Returns a permission definition that allows rule: <%= projectPrefix %>-<%= ruleName %> to access
 * lambda function: <%= projectPrefix %>-<%= ruleLambdaFunction %>, for environment: <%= envStr %>.
 */
module.exports = (dirInfo) => {
    const envStr = '<%= envStr %>';

    const ruleName = '<%= projectPrefix %>-<%= ruleName %>';
    const functionName = '<%= projectPrefix %>-<%= ruleLambdaFunction %>';
    const alias = envStr;

    const permissionKey = dirInfo.getNamespacedToken('lambda_permission', `${functionName}_${alias}_${ruleName}`);

    return new PermissionTemplate(permissionKey, functionName, alias)
        .setAction('InvokeFunction')
        .setPrincipal('events.amazonaws.com')
        .setEventRuleSource(ruleName);
};
