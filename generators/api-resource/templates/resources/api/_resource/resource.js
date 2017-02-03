'use strict';

const ApiGatewayTemplates = require('wysknd-aws-cf-generator').ApiGatewayTemplates;
const ResourceTemplate = ApiGatewayTemplates.ResourceTemplate;

module.exports = (dirInfo) => {
    const resourceKey = dirInfo.getToken('RES');

<% if(isDynamic) { -%>
    return new ResourceTemplate(resourceKey, `{${dirInfo.name}}`)
<% } else { -%>
    return new ResourceTemplate(resourceKey, dirInfo.name)
<% } -%>
<% if(isRoot) { -%>
        .setRestApiId(dirInfo);
<% } else { -%>
        .setRestApiId(dirInfo)
        .setParentResource(dirInfo);
<% } -%>
};
