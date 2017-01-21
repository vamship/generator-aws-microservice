'use strict';

const IamTemplates = require('wysknd-aws-cf-generator').IamTemplates;
const RoleTemplate = IamTemplates.RoleTemplate;
const PolicyDocument = IamTemplates.PolicyDocument;
const PolicyStatement = IamTemplates.PolicyStatement;

module.exports = (dirInfo) => {
    const roleName = '<%= projectPrefix %>.<%= roleName %>';
    const key = dirInfo.getNamespacedToken('iam_role', roleName);

    return new RoleTemplate(key, roleName)
        .setAssumePolicy(
            (new PolicyDocument())
                .addStatement((new PolicyStatement())
                    .addAction('sts:AssumeRole')
                    .addServicePrincipal('lambda.amazonaws.com')))
<% if(rolePolicies.indexOf('ALL_ACCESS') >= 0) { -%>
        .addAwsManagedPolicy('AWSLambdaFullAccess')
<% } -%>
<% if(rolePolicies.indexOf('DYNAMO_READ_ONLY') >= 0) { -%>
        .addAwsManagedPolicy('service-role/AWSLambdaDynamoDBExecutionRole')
<% } -%>
<% if(rolePolicies.indexOf('S3_READ_WRITE') >= 0) { -%>
        .addAwsManagedPolicy('AmazonS3ReadOnlyAccess')
<% } -%>
<% if(rolePolicies.indexOf('S3_READ_WRITE') >= 0) { -%>
        .addAwsManagedPolicy('AmazonS3FullAccess')
<% } -%>
<% if(rolePolicies.indexOf('LAMBDA_INVOKE') >= 0) { -%>
        .addAwsManagedPolicy('service-role/AWSLambdaRole')
<% } -%>
<% if(rolePolicies.indexOf('KINESIS_READ_ONLY') >= 0) { -%>
        .addAwsManagedPolicy('service-role/AWSLambdaKinesisExecutionRole')
<% } -%>
<% if(rolePolicies.indexOf('DYNAMO_READ_WRITE') >= 0) { -%>
        .addPolicy('dynamoDbReadWritePolicy',
            (new PolicyDocument())
            .addStatement((new PolicyStatement())
                .addAction('dynamodb:*')
                .addResource('*')
            )
        )
<% } -%>
        .addAwsManagedPolicy('service-role/AWSLambdaBasicExecutionRole');
};
