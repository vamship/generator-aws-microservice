'use strict';

const _camelCase = require('camelcase');
const LambdaTemplates = require('wysknd-aws-cf-generator').LambdaTemplates;
const FunctionTemplate = LambdaTemplates.FunctionTemplate;
const _lambdaConfig = require('../../../src/lambda-config');

module.exports = (dirInfo) => {
    return _lambdaConfig.lambdas.map((lambda) => {
        const roleName = '<%= projectPrefix %>.default_lambda_role';
        const key = _camelCase(lambda.functionName);
        const roleKey = dirInfo.getRootToken(roleName);

        const template = new FunctionTemplate(key, lambda.functionName, lambda.handlerName)
            .setRole(`$REGION.${roleName}`)
            .addDependency(roleKey);

        if (typeof lambda.description === 'string' &&
            lambda.description.length > 0) {
            template.setDescription(lambda.description);
        }

        if (typeof lambda.memory === 'number') {
            template.setMemorySize(lambda.memory);
        }

        if (typeof lambda.timeout === 'number') {
            template.setTimeout(lambda.timeout);
        }

        return template;
    });
};
