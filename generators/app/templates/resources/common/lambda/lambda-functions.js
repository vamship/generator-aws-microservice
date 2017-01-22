'use strict';

const LambdaTemplates = require('wysknd-aws-cf-generator').LambdaTemplates;
const FunctionTemplate = LambdaTemplates.FunctionTemplate;
const AliasTemplate = LambdaTemplates.AliasTemplate;

const _lambdaConfig = require('../../../src/lambda-config');

module.exports = (dirInfo) => {
    const environments = [<%- projectTargetEnvironments.map(item => `'${item}'`).join(',') %>];

    return _lambdaConfig.lambdas.map((lambda) => {
        const roleName = '<%= projectPrefix %>.default_lambda_role';
        const roleKey = dirInfo.getNamespacedToken('iam_role', roleName);

        const functionName = lambda.functionName;
        const functionKey = dirInfo.getNamespacedToken('lambda_function', functionName);

        const functionTemplate = new FunctionTemplate(functionKey, functionName, lambda.handlerName)
            .setRole(`$REGION.${roleName}`)
            .addDependency(roleKey);

        if (typeof lambda.description === 'string' &&
            lambda.description.length > 0) {
            functionTemplate.setDescription(lambda.description);
        }

        if (typeof lambda.memory === 'number') {
            functionTemplate.setMemorySize(lambda.memory);
        }

        if (typeof lambda.timeout === 'number') {
            functionTemplate.setTimeout(lambda.timeout);
        }

        const aliasTemplates = environments.map((envName) => {
            const aliasKey = dirInfo.getNamespacedToken('lambda_alias', `${functionName}_${envName}`);
            return new AliasTemplate(aliasKey, envName, functionName)
                .addDependency(functionKey);
        });

        return [functionTemplate].concat(aliasTemplates);
    }).reduce((result, item) => {
        return result.concat(item);
    }, []);
};
