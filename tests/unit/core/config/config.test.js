/**
 * This file is part of the "Linkstore" project.
 *
 * (c) 2017 - Ringabell
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */
'use strict';

const chai   = require('chai');
const expect = chai.expect;
const fork   = require('child_process').fork;

const config = require('../../../../src/server/core/config');

describe('Config Module', () => {
    it('should return a value set at the top of root object', () => {
        config.set('testKey', 'testValue');
        const result = config.get('testKey');

        expect(result).to.be.equal('testValue');
    });

    it('should return a value set on sub object', () => {
        config.set('testKey1.testKey2.testKey3', 'testValue');
        expect(config.get('testKey1')).to.exist;
        expect(config.get('testKey1.testKey2')).to.exist;
        expect(config.get('testKey1.testKey2.testKey3')).to.be.equal('testValue');
    });

    it('should remove a key set with an empty value', () => {
        config.set('testKey1.testKey2.testKey3', 'testValue');
        config.set('testKey1.testKey2.testKey3');
        expect(config.get('testKey1.testKey2.testKey3')).not.to.exist;
    });

    it('should be able to override some config keys from environment variables', function (done) {
        this.timeout(10000);
        expect(config.get('technical.apiBaseUrl')).to.exist;

        const env = { API_BASE_URL: 'http://someurl.com', FORK: 'true' };

        const child = fork(`${__dirname}/config.fork.js`, ['technical.apiBaseUrl'], { env: env, silent: true });
        child.stdout.on('data', (data) => {
            const output = data.toString().replace('\n', '');
            expect(config.get('technical.apiBaseUrl')).not.to.equal(output);
            expect(output).to.equal(env.API_BASE_URL);
            done();
        });
    });
});

