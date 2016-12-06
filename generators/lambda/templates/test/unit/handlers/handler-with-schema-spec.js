/* jshint node:true, expr:true */
'use strict';

const _sinon = require('sinon');
const _chai = require('chai');
_chai.use(require('sinon-chai'));
_chai.use(require('chai-as-promised'));
const expect = _chai.expect;

const _loggerProvider = require('wysknd-common').loggerProvider;
_loggerProvider.enableMock();

const _rewire = require('rewire');
const _testHelper = require('wysknd-test');
const LambdaWrapper = _testHelper.AwsLambdaWrapper;
const _testValueProvider = _testHelper.testValueProvider;
const _testUtils = _testHelper.utils;

let _handler = null;

describe('[<%= lambdaHandlerName %>]', () => {
    const DEFAULT_FIRST_NAME = 'John';
    const DEFAULT_LAST_NAME = 'Doe';
    const DEFAULT_MIDDLE_NAME = 'Samuel';

    function _createWrapper(event, alias, config) {
        event = event || {};
        event.user = event.user || {};
        event.user.firstName = event.user.firstName || DEFAULT_FIRST_NAME;
        event.user.lastName = event.user.lastName || DEFAULT_LAST_NAME;

        const contextInfo = {
            alias: alias
        };

        config = config || {};

        return new LambdaWrapper(_handler, event, contextInfo, config);
    }

    beforeEach(() => {
        _handler = _rewire('../../../src/handlers/<%= lambdaHandlerFile %>');
    });

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

    describe('[execution]', () => {
        it('should invoke the callback with a success message', () => {
            const wrapper = _createWrapper(undefined, 'dev');
            const expectedMessage = 'Lambda function [<%= lambdaFunctionName %>] executed successfully';

            expect(wrapper.callback).to.not.have.been.called;
            const result = wrapper.testSuccess()
            expect(result).to.equal(null, expectedMessage);
        });
    });
});
