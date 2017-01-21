'use strict';

<%
var indexNames = Object.keys(tableIndexMap);
var hasGlobalIndex = !!indexNames.find((name) => !!tableIndexMap[name].isGlobalIndex);
var hasLocalIndex = !!indexNames.find((name) => !tableIndexMap[name].isGlobalIndex);
-%>
const Environment = require('wysknd-aws-lambda').Environment;
const DynamoDbTemplates = require('wysknd-aws-cf-generator').DynamoDbTemplates;
const TableTemplate = DynamoDbTemplates.TableTemplate;
<% if(hasGlobalIndex) { -%>
const GlobalSecondaryIndex = DynamoDbTemplates.GlobalSecondaryIndex;
<% } -%>
<% if(hasLocalIndex) { -%>
const LocalSecondaryIndex = DynamoDbTemplates.LocalSecondaryIndex;
<% } -%>

/**
 * Returns the table definition for the <%= tableName %> table.
 */
module.exports = (dirInfo) => {
    const environments = [<%- projectTargetEnvironments.map(item => `'${item}'`).join(',') %>];

    return environments.map((envName) => {
        const env = new Environment(envName);
        const tableName = env.getSuffixString('<%= projectPrefix %>.<%= tableName %>');
        const key = dirInfo.getNamespacedToken('dynamodb_table', tableName);
        return (new TableTemplate(key, tableName))
            .addKey('<%= tableHashKey %>', '<%= tableHashKeyType %>', 'HASH')
<% if(typeof tableRangeKey === 'string' && tableRangeKey.length > 0) { -%>
            .addKey('<%= tableRangeKey %>', '<%= tableRangeKeyType %>', 'RANGE')
<% } -%>
            .setReadCapacity(<%= tableReadCapacity %>)
            .setWriteCapacity(<%= tableWriteCapacity %>)<%= (indexNames.length > 0)? '\n':';\n' -%>
<%
indexNames.forEach((indexName, index) => {
    var indexInfo = tableIndexMap[indexName];
    var closingParen = (index >= indexNames.length - 1)? ');':')';
    var projectionAttrCount = indexInfo.projectionAttributes.length;
    if(!indexInfo.isGlobalIndex) { -%>
            .addLocalSecondaryIndex(
                (new LocalSecondaryIndex('<%= indexName %>'))
<%    } else { -%>
            .addGlobalSecondaryIndex(
                (new GlobalSecondaryIndex('<%= indexName %>'))
                    .setReadCapacity(<%= indexInfo.readCapacity %>)
                    .setWriteCapacity(<%= indexInfo.writeCapacity %>)
<% } -%>
                    .addKey('<%= indexInfo.hashKey %>', '<%= indexInfo.hashKeyType %>', 'HASH')
                    .addKey('<%= indexInfo.rangeKey %>', '<%= indexInfo.rangeKeyType %>', 'RANGE')
                    .setProjectionType('<%= indexInfo.projectionType %>')<%= (projectionAttrCount <= 0)? closingParen:''; %>
<% if(indexInfo.projectionType === 'INCLUDE') {
    indexInfo.projectionAttributes.forEach((attr, attrIndex) => {
        var isLastAttr = (attrIndex >= projectionAttrCount - 1);
        if(typeof attr === 'string' && attr.length > 0) { -%>
                    .addNonKeyAttribute('<%= attr %>')<%= (isLastAttr)? closingParen:'' %>
<%
        }
    });
} -%>
<% }); -%>
    });
};
