'use strict';

const HandlerWrapper = require('wysknd-aws-lambda').HandlerWrapper;
const _wrapper = new HandlerWrapper('<%= projectName %>');
const _lambdaConfig = require('./lambda-config.json');

/**
 * Dynamically load and export handlers.
 */
_lambdaConfig.lambdas.forEach((definition) => {
    const handlerName = definition.handlerName.split('.')[1];
    const handler = require(`./handlers/${definition.fileName}`);

    exports[handlerName] = _wrapper.wrap(handler, handlerName);
});
