'use strict';

const IamTemplates = require('wysknd-aws-cf-generator').IamTemplates;
const RoleTemplate = IamTemplates.RoleTemplate;
const PolicyDocument = IamTemplates.PolicyDocument;
const PolicyStatement = IamTemplates.PolicyStatement;

module.exports = (dirInfo) => {
    const roleName = '<%= projectPrefix %>.<%= roleName %>';
    const key = dirInfo.getRootToken(roleName);

    return new RoleTemplate(key, roleName)
                .addAwsManagedPolicy('service-role/AWSLambdaBasicExecutionRole')
                .setAssumePolicy(
                    (new PolicyDocument())
                    .addStatement((new PolicyStatement())
                        .addAction('sts:AssumeRole')
                        .addServicePrincipal('lambda.amazonaws.com'))
                )
<% if(rolePolicies.indexOf(' All AWS Services (Be careful with this one ..)') >= 0) { -%>
                .addAwsManagedPolicy('AWSLambdaFullAccess');
<% } -%>
<% if(rolePolicies.indexOf(' DynamoDb Read Only') >= 0) { -%>
                .addAwsManagedPolicy('service-role/AWSLambdaDynamoDBExecutionRole');
<% } -%>
<% if(rolePolicies.indexOf(' S3 Read Only') >= 0) { -%>
                .addAwsManagedPolicy('AmazonS3ReadOnlyAccess');
<% } -%>
<% if(rolePolicies.indexOf(' S3 Read/Write') >= 0) { -%>
                .addAwsManagedPolicy('AmazonS3FullAccess');
<% } -%>
<% if(rolePolicies.indexOf(' Lambda Invoke') >= 0) { -%>
                .addAwsManagedPolicy('service-role/AWSLambdaRole');
<% } -%>
<% if(rolePolicies.indexOf(' Kinesis Read Only') >= 0) { -%>
                .addAwsManagedPolicy('service-role/AWSLambdaKinesisExecutionRole');
<% } -%>
<% if(rolePolicies.indexOf(' DynamoDb Read/Write') >= 0) { -%>
                .addPolicy('dynamoDbReadWritePolicy', 
                    (new PolicyDocument())
                    .addStatement((new PolicyStatement())
                        .addAction('*')
                        .addResource('dynamodb:*')
                    )
                )
<% } -%>
                ;
};
