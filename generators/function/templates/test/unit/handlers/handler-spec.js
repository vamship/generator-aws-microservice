'use strict';

const _chai = require('chai');
_chai.use(require('sinon-chai'));
_chai.use(require('chai-as-promised'));
const expect = _chai.expect;

const _loggerProvider = require('wysknd-log').loggerProvider;
_loggerProvider.enableMock();

const _rewire = require('rewire');
const _shortId = require('shortid');
const _testHelper = require('wysknd-test');
const LambdaWrapper = _testHelper.aws.LambdaWrapper;
const _testValueProvider = _testHelper.testValueProvider;
const _testUtils = _testHelper.utils;

let _handler = null;

describe('[<%= lambdaHandlerName %>]', () => {
<%if (lambdaHasSchema) {-%>
    const DEFAULT_FIRST_NAME = 'John';
    const DEFAULT_LAST_NAME = 'Doe';
<%} -%>
    function _getWrapperBuilder(defaultOptions) {
        defaultOptions = Object.assign({
<%if (lambdaHasSchema) {-%>
            input: {
                user: {
                    firstName: _shortId.generate(),
                    lastName: _shortId.generate()
                }
            },
<%} -%>
            env: 'dev',
            config: {}
        }, defaultOptions);

        return (options) => {
            options = Object.assign({}, defaultOptions, options);
            const event = Object.assign({}, defaultOptions.input, options.input);
            const contextInfo = Object.assign({
                alias: options.env || defaultOptions.env
            });
            const config = Object.assign({}, defaultOptions.config, options.config);
            return new LambdaWrapper(_handler, event, contextInfo, config);
        };
    }

    beforeEach(() => {
        _handler = _rewire('../../../src/handlers/<%= lambdaHandlerFile %>');
    });

<%if (lambdaHasSchema) {-%>
    describe('[input validation]', () => {

        it('should fail execution if the event does not define a valid user object', () => {
            const error = _testUtils.generateSchemaErrorPattern('user');
            _testValueProvider.allButObject().forEach((user) => {
                const wrapper = new LambdaWrapper(_handler, {
                    user: user
                });
                wrapper.testError(error);
            });
        });

        it('should fail execution if the user object does not define a valid firstName property', () => {
            const error = _testUtils.generateSchemaErrorPattern('firstName');
            _testValueProvider.allButString('').forEach((firstName) => {
                const wrapper = new LambdaWrapper(_handler, {
                    user: {
                        firstName: firstName
                    }
                });
                wrapper.testError(error);
            });
        });

        it('should fail execution if the user object does not define a valid lastName property', () => {
            const error = _testUtils.generateSchemaErrorPattern('lastName');
            _testValueProvider.allButString('').forEach((lastName) => {
                const wrapper = new LambdaWrapper(_handler, {
                    user: {
                        firstName: DEFAULT_FIRST_NAME,
                        lastName: lastName
                    }
                });
                wrapper.testError(error);
            });
        });

        it('should fail execution if the user object defines a middleName property of the incorrect type', () => {
            const error = _testUtils.generateSchemaErrorPattern('middleName');
            _testValueProvider.allButSelected('undefined', 'string').forEach((middleName) => {
                const wrapper = new LambdaWrapper(_handler, {
                    user: {
                        firstName: DEFAULT_FIRST_NAME,
                        lastName: DEFAULT_LAST_NAME,
                        middleName: middleName
                    }
                });
                wrapper.testError(error);
            });
        });
    });

<%} -%>
    describe('[execution]', () => {
        it('should invoke the callback with a success message', () => {
            const createWrapper = _getWrapperBuilder();
            const wrapper = createWrapper({
                env: 'dev'
            });
            const expectedMessage = 'Lambda function [<%= lambdaFunctionName %>] executed successfully';

            expect(wrapper.callback).to.not.have.been.called;
            const result = wrapper.testSuccess();
            expect(result).to.equal(expectedMessage);
        });
    });
});
