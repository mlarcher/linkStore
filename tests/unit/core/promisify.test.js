/**
 * This file is part of the "Linkstore" project.
 *
 * (c) 2017 - Ringabell
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */
'use strict';

const chai           = require('chai');
const chaiAsPromised = require('chai-as-promised');
const expect         = chai.expect;
const sinonChai      = require('sinon-chai');


chai.use(sinonChai);
chai.use(chaiAsPromised);

const promisify           = require('../../../src/server/core/utils/promisify');
const logger              =  require('../../../src/server/core/utils/logger');
const loggerStubUtilities = require('../loggerStubUtilities');


require('sinon-as-promised');


describe('promisify', () => {

    const successFn = function (...args) {
        args[args.length - 1](null, args[0]);
    };
    const errorFn = function (...args) {
        args[args.length - 1]('error');
    };


    beforeEach(() => {
        loggerStubUtilities.stubLogger();
        loggerStubUtilities.loggerSpy();
    });
    afterEach(() => {
        loggerStubUtilities.restoreLogger();
        loggerStubUtilities.resetSpy();
    });

    it('should resolve if the function callback succeeds', () => {
        const promise = promisify(successFn, 'a');

        return expect(promise).to.be.fulfilled
            .then(data => {
                return expect(data).to.equal('a');
            });
    });

    it('should reject if the function callback returns an error', () => {
        const promise = promisify(errorFn, 'a');

        return expect(promise).to.be.rejected
            .then(err => {
                return expect(err).to.equal('error');
            });
    });

    it('should work if a callback is passed', () => {
        const promise = promisify(successFn, 'a', () => {});

        return expect(promise).to.be.fulfilled
            .then(() => {
                expect(logger.warn).to.have.been.calledOnce;
                expect(logger.warn.calledWith('Callbacks are not handled by promisify')).to.be.true;
            });
    });

});
