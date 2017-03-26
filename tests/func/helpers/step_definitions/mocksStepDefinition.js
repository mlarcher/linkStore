/**
 * This file is part of the "Linkstore" project.
 *
 * (c) 2017 - Ringabell
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */
'use strict';

const chai    = require('chai');
const expect  = chai.expect;
const request = require('request');
const path    = require('path');

const config  = require('../../../../src/server/core/config');

const mocksBaseUrl = config.get('technical.mocksBaseUrl');

module.exports = function () {

    this.Then(
        /^mock defined in (.*) should have been called$/,
        (fileName, callback) => {
            const mockMapping = require(path.join(__dirname, '../../../../mocks/mappings', fileName)); // eslint-disable-line global-require

            const requestConfig = {
                url: `${mocksBaseUrl}/__admin/requests/count`,
                method:  'POST',
                json:    true,
                body:    mockMapping.request,
            };

            request(requestConfig, function (err, response, body) {
                if (err) {
                    return callback(err);
                }
                try {
                    expect(body.count).to.be.above(0);
                } catch (e) {
                    return callback(e);
                }
                callback();
            });
        }
    );

};
