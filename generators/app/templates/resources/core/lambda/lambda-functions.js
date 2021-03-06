'use strict';

const Environment = require('wysknd-aws-lambda').Environment;
const LambdaTemplates = require('wysknd-aws-cf-generator').LambdaTemplates;
const FunctionTemplate = LambdaTemplates.FunctionTemplate;
const AliasTemplate = LambdaTemplates.AliasTemplate;

const _lambdaConfig = require('../../../src/lambda-config');

module.exports = (dirInfo) => {
    const environments = [<%- projectTargetEnvironments.map(item => `'${item}'`).join(', ') %>];

    return _lambdaConfig.lambdas.map((lambda) => {
        const roleName = '<%= projectPrefix %>-lambda_role';
        const roleKey = dirInfo.getNamespacedToken('iam_role', roleName);

        const functionName = lambda.functionName;
        const functionKey = dirInfo.getNamespacedToken('lambda_function', functionName);

        const functionTemplate = new FunctionTemplate(functionKey, functionName, lambda.handlerName)
            .setRuntime('nodejs6.10')
            .setRole(`$REGION_${roleName}`)
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

        const aliasTemplates = environments.map((envStr) => {
            const env = new Environment(envStr);
            const aliasToken = env.getSuffixString(functionName);

            const aliasKey = dirInfo.getNamespacedToken('lambda_alias', aliasToken);
            return new AliasTemplate(aliasKey, envStr, functionName)
                .addDependency(functionKey);
        });

        return [functionTemplate].concat(aliasTemplates);
    }).reduce((result, item) => {
        return result.concat(item);
    }, []);
};
