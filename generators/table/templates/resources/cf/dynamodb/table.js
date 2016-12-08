'use strict';

const Environment = require('wysknd-aws-lambda').Environment;
const DynamoDbTemplates = require('wysknd-aws-cf-generator').DynamoDbTemplates;
const TableTemplate = DynamoDbTemplates.TableTemplate;
const LocalSecondaryIndex = DynamoDbTemplates.LocalSecondaryIndex;
const GlobalSecondaryIndex = DynamoDbTemplates.GlobalSecondaryIndex;

/**
 * Returns the table definition for the <%= tableName %> table.
 */
module.exports = (dirInfo) => {

    const environments = [
<% tableTargetEnvironments.forEach((env, index) => { -%>
        '<%= env %>'<%= (index<tableTargetEnvironments.length -1)? ',':'' %>
<% }) -%>
    ];

    return environments.map((envName) => {
        const env = new Environment(envName);
        const tableName = env.getSuffixString('<%= projectPrefix %>.<%= tableName %>');
        const key = dirInfo.getToken(tableName);
        return (new TableTemplate(key, tableName))
            .addKey('<%= tableHashKey %>', '<%= tableHashKeyType %>', 'HASH')
<% if(typeof tableRangeKey === 'string' && tableRangeKey.length > 0) { -%>
            .addKey('<%= tableRangeKey %>', '<%= tableRangeKeyType %>', 'RANGE')
<% } -%>
            .setReadCapacity(<%= tableReadCapacity %>)
            .setWriteCapacity(<%= tableWriteCapacity %>)
<% for(var indexName in tableIndexMap) { 
    var indexInfo = tableIndexMap[indexName];                
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
<% if(typeof indexInfo.rangeKey === 'string' && indexInfo.rangeKey.length > 0) { -%>
                .addKey('<%= indexInfo.rangeKey %>', '<%= indexInfo.rangeKeyType %>', 'RANGE')
<% } -%>
                .setProjectionType('<%= indexInfo.projectionType %>')
<% if(indexInfo.projectionType === 'INCLUDE') {
    indexInfo.projectionAttributes.forEach((attr) => { 
        if(typeof attr === 'string' && attr.length > 0) { -%>
                .addNonKeyAttribute('<%= attr %>')
<% 
        }
    });
} -%>
            )
<% } -%>
        ;
    });
};
