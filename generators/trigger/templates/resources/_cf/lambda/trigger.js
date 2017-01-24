'use strict';

const Environment = require('wysknd-aws-lambda').Environment;
const LambdaTemplates = require('wysknd-aws-cf-generator').LambdaTemplates;
const EventSourceMappingTemplate = LambdaTemplates.EventSourceMappingTemplate;

/**
 * Returns a trigger definition that invokes lambda <%= triggerLambdaFunction %>
 * in response to events from table <%= projectPrefix %>.<%= triggerTableSource %>
 * for environment: <%= envStr %>.
 */
module.exports = (dirInfo) => {
    const envStr = '<%= envStr %>';
    const env = new Environment(envStr);

    const mappingName = env.getSuffixString('<%= projectPrefix %>-<%= triggerName %>');
    const mappingKey = dirInfo.getNamespacedToken('lambda_event', mappingName);

    const tableName = env.getSuffixString('<%= projectPrefix %>-<%= triggerTableSource %>');
    const tableKey = dirInfo.getNamespacedToken('dynamodb_table', tableName);

    const functionName = '<%= triggerLambdaFunction %>';

    const alias = envStr;

    return new EventSourceMappingTemplate(mappingKey)
        .setBatchSize(<%= triggerBatchSize %>)
        .setEnabled(true)
        .setStartingPosition('<%= triggerStartPosition %>')
        .setDynamoDbSourceByResource(tableKey)
        .setFunction(functionName, alias)
        .addDependency(tableKey);
};
