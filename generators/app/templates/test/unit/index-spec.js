/* jshint node:true, expr:true */
'use strict';

const _chai = require('chai');
_chai.use(require('sinon-chai'));
_chai.use(require('chai-as-promised'));
const expect = _chai.expect;

const _index = require('../../src/index');
const _lambdaConfig = require('../../src/lambda-config.json');

describe('_index', () => {
    describe('[handlers]', () => {
        it('should define the expected handlers', () => {
            _lambdaConfig.lambdas.forEach((definition) => {
                const handlerName = definition.handlerName.split('.')[1];

                expect(_index[handlerName]).to.be.a('function');
            });
        });
    });
});
