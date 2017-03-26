/**
 * This file is part of the "Linkstore" project.
 *
 * (c) 2017 - Ringabell
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */
'use strict';
const request      = require('request');
const seedUtils = require('../../../commonHelpers/seedUtils');
const config       = require('../../../../src/server/core/config');

const mocksBaseUrl = config.get('technical.mocksBaseUrl');

let startTime;
const durationThreshold = 500;
const slowScenarios     = [];

const myHandlers = function () {

    this.registerHandler('BeforeFeature', (feature, callback) => {

        if (process.env.NO_DBLOAD === undefined) {
            // clean db and load seeds
            console.log(`Initializing database for feature ${feature.getName()}`); // eslint-disable-line no-console
            seedUtils.reset()
                .then(() => {
                    callback();
                })
                .catch(err => {
                    console.log(err); // eslint-disable-line no-console
                    callback();
                    process.exit(1);
                })
            ;
        } else {
            console.log('Skipping database reload'); // eslint-disable-line no-console
            callback();
        }
    });

    this.registerHandler('BeforeScenario', () => {
        startTime = new Date();
    });

    this.registerHandler('AfterScenario', (scenario) => {
        const endTime = new Date();
        const duration = endTime.getTime() - startTime.getTime();

        const scenarioTags = scenario.getTags().map(tag => tag.getName());

        if (duration > durationThreshold) {
            slowScenarios.push({
                duration:     `${duration}ms`,
                featureName:  scenario.getFeature().getName(),
                scenarioName: scenario.getName(),
                URI:          `${scenario.getUri()}:${scenario.getLine()}`,
                scenarioTags,
            });
            console.log('WARNING: Scenario was slow to respond'); // eslint-disable-line no-console
        }
    });

    this.registerHandler('BeforeFeatures', (feature, callback) => {
        request.post(`${mocksBaseUrl}/__admin/requests/reset`,
        (err, response) => {
            if (err || response.statusCode !== 200) {
                console.error('wiremock journal reset failed:', err); // eslint-disable-line no-console
                callback();
                process.exit(1);
            }
            console.log('wiremock journal reset');// eslint-disable-line no-console
            callback();
        });
    });

    this.registerHandler('AfterFeatures', (feature, callback) => {
        request.get(`${mocksBaseUrl}/__admin/requests/unmatched`, (err, response, body) => {
            if (err || response.statusCode !== 200) {
                console.error('wiremock journal check failed:', err); // eslint-disable-line no-console
                callback();
                process.exit(1);
            }
            const content = JSON.parse(body);
            if (content.requests.length) {
                console.log('The following http calls were not matched by wiremock:'); // eslint-disable-line no-console
                console.log(content.requests); // eslint-disable-line no-console
                console.log('Some http calls were not matched by wiremock!'); // eslint-disable-line no-console
                callback();
                process.exit(1);
            }

            if (slowScenarios.length) {
                console.log('WARNING: The following scenarios where flagged as slow:'); // eslint-disable-line no-console
                console.log(slowScenarios); // eslint-disable-line no-console
            }

            callback();
        });
    });
};

module.exports = myHandlers;
