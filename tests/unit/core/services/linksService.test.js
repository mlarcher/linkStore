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
const sinon          = require('sinon');
const sinonChai      = require('sinon-chai');
const nock           = require('nock');


chai.use(sinonChai);
chai.use(chaiAsPromised);

const linksService        = require('../../../../src/server/services/linksService');
// const logger              = require('../../../../src/server/core/utils/logger');
const loggerStubUtilities = require('../../loggerStubUtilities');
const baseDao             = require('../../../../src/server/dao/baseDao');


require('sinon-as-promised');


describe('linksService', () => {

    beforeEach(() => {
        loggerStubUtilities.stubLogger();
        loggerStubUtilities.loggerSpy();
    });
    afterEach(() => {
        loggerStubUtilities.restoreLogger();
        loggerStubUtilities.resetSpy();
    });

    describe('add()', () => {
        let baseDaoFindOneStub;
        let baseDaoInsertStub;

        beforeEach(() => {
            baseDaoFindOneStub = sinon.stub(baseDao, 'findOne');
            baseDaoFindOneStub.resolves(null);
            baseDaoFindOneStub.withArgs('links', { url: 'http://already.exist.com' }).resolves({});

            baseDaoInsertStub = sinon.stub(baseDao, 'insert');
            baseDaoInsertStub.resolves({ id: 1, url: 'http://inserted.url.com' });

        });

        afterEach(() => {
            baseDaoFindOneStub.restore();
            baseDaoInsertStub.restore();
        });

        it('should reject if the url is not valid', () => {
            const promise = linksService.add('nope', {});

            return expect(promise).to.be.rejected
                .then(err => {
                    return expect(err.message).to.equal('Invalid parameter');
                });
        });

        it('should reject if the url is already in db', () => {
            const promise = linksService.add('http://already.exist.com', {});

            return expect(promise).to.be.rejected
                .then(err => {
                    return expect(err.message).to.equal('URL is already in db');
                });
        });

        it('should reject in case of network error', () => {
            nock('http://network.error.com')
                .get('/')
                .query({})
                .replyWithError({
                    message: 'error nock',
                });

            const promise = linksService.add('http://network.error.com', {});

            return expect(promise).to.be.rejected
                .then(err => {
                    return expect(err.message).to.equal('URL failed, error: error nock');
                });
        });

        it('should reject in case of non 200 status code', () => {
            nock('http://not.found.com')
                .get('/')
                .query({})
                .reply(404);

            const promise = linksService.add('http://not.found.com', {});

            return expect(promise).to.be.rejected
                .then(err => {
                    return expect(err.message).to.equal('URL failed, statusCode: 404');
                });
        });


        it('should insert the expected data in db', () => {
            nock('http://ok.com')
                .get('/')
                .query({})
                .reply(200, '<html><head><title>some title</title></head><body>some body</body></html>');

            const promise = linksService.add('http://ok.com', {});

            return expect(promise).to.be.fulfilled
                .then(() => {
                    expect(baseDaoInsertStub).to.have.been.calledWith('links', {
                        url: 'http://ok.com',
                        title: 'some title',
                        votes: 0,
                    });
                });
        });

        it('should insert respond with the data created object from db', () => {
            nock('http://ok2.com')
                .get('/')
                .query({})
                .reply(200, '<html><head><title>some title</title></head><body>some body</body></html>');

            const promise = linksService.add('http://ok2.com', {});

            return expect(promise).to.be.fulfilled
                .then(data => {
                    expect(data).to.be.an('object');
                    expect(data).to.have.property('url', 'http://inserted.url.com');
                });
        });

    });

});
