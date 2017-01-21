'use strict';

const Environment = require('wysknd-aws-lambda').Environment;
const LambdaTemplates = require('wysknd-aws-cf-generator').LambdaTemplates;
const EventSourceMappingTemplate = LambdaTemplates.EventSourceMappingTemplate;

module.exports = (dirInfo) => {
    const environments = [<%- projectTargetEnvironments.map(item => `'${item}'`).join(',') %>];

    return environments.map((envName) => {
        const env = new Environment(envName);

        const mappingName = env.getSuffixString('<%= projectPrefix %>.<%= triggerName %>');
        const mappingKey = dirInfo.getNamespacedToken('lambda_event', mappingName);

        const tableName = env.getSuffixString('<%= projectPrefix %>.<%= triggerTableSource %>');
        const tableKey = dirInfo.getNamespacedToken('dynamodb_table', tableName);

        const functionName = '<%= triggerLambdaFunction %>';
        const functionKey = dirInfo.getNamespacedToken('lambda_function', functionName);

        const alias = envName;

        return new EventSourceMappingTemplate(mappingKey)
            .setBatchSize(<%= triggerBatchSize %>)
            .setEnabled(true)
            .setStartingPosition('<%= triggerStartPosition %>')
            .setDynamoDbSourceByResource(tableKey)
            .setFunction(functionName, alias)
            .addDependency(tableKey)
            .addDependency(functionKey);
    });
};
