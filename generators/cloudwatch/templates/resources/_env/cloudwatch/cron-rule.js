'use strict';

const CloudWatchTemplates = require('wysknd-aws-cf-generator').CloudWatchTemplates;
const EventRuleTemplate = CloudWatchTemplates.EventRuleTemplate;

/**
 * Returns an event rule definition that invokes lambda <%= projectPrefix %>-<%= ruleLambdaFunction %>
 * based on a predefined cron schedule, for environment: <%= envStr %>.
 */
module.exports = (dirInfo) => {
    const envStr = '<%= envStr %>';

    const ruleName = '<%= projectPrefix %>-<%= ruleName %>';
    const ruleKey = dirInfo.getNamespacedToken('cloudwatch_event_rule', ruleName);

    const functionName = '<%= projectPrefix %>-<%= ruleLambdaFunction %>';

    return new EventRuleTemplate(ruleKey, ruleName)
        .setCronSchedule(1)
        .addTargetLambda('<%= ruleLambdaTargetName %>', {
            name: functionName,
            suffix: envStr
        })
        .setEnabled(true);
};
