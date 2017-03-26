/**
 * This file is part of the "Linkstore" project.
 *
 * (c) 2017 - Ringabell
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */
'use strict';

const _             = require('lodash');
const chai          = require('chai');
const expect        = chai.expect;
const request       = require('request').defaults({ json: true });
const querystring   = require('querystring');


const { coerceToType } = require('../tools.js');

module.exports = function () {

    const self = this;

    this.Given(/^(.*) as (.*) in the queryString$/, (value, attribute) => {
        this.qs            = this.qs || {};
        this.qs[attribute] = value;
    });

    this.Given(/^(?:I )?set queryString to$/, step => {
        this.qs = Object.assign({}, this.qs, step.rowsHash());
    });

    this.Given(/^(?:I )?set query parameter (.*) to (.*)$/, (attribute, value) => {
        this.qs            = this.qs || {};
        this.qs[attribute] = value;
    });

    this.Given(/^I set header (.*) to (.*)$/, (headerName, headerValue) => {
        const value              = (headerValue === 'null') ? null : headerValue;
        this.headers             = this.headers || {};
        this.headers[headerName] = value;
    });

    this.Given(/^I set headers to$/, step => {
        this.headers = Object.assign({}, this.headers, step.rowsHash());
    });

    this.Given(/^I set request body to$/, step => {
        const bodyObject = step.rowsHash();

        Object.keys(bodyObject).forEach(key => {
            _.set(this.body, key, coerceToType(bodyObject[key]));
        });
    });

    this.Given(/^(.*) as JSON body/, (body) => {
        this.body = JSON.parse(body);
    });

    this.Given(/^(?:I )?set request form body to$/, step => {
        const bodyObject = step.rowsHash();

        this.body = querystring.stringify(bodyObject);
    });

    this.Given(/^(?:I )?reset request parameters$/, () => {
        this.qs      = {};
        this.body    = {};
        this.headers = {};
    });

    this.Given(/^(?:I )?wait for (\d+) ms$/, (waitTime, callback) => {
        setTimeout(callback, waitTime);
    });

    this.Given(/^(?:I )?store the value from path (.*) as (.*)$/, (path, key) => {
        this.scenarioStorage.set(key, _.get(this.http.body, path));
    });

    this.When(/^(?:I )?GET (.*)$/, (path, callback) => {
        const uri = hydrateFromStorage(path);
        const options = {
            baseUrl: this.API_BASE_URL,
            uri,
            method:  'GET',
            qs:      this.qs || {},
            headers: this.headers || {},
        };

        request(options, (error, response, body) => {
            this.http = { error, response, body };
            if (error) {
                console.error(error, options); // eslint-disable-line no-console
            }

            callback();
        });
    });

    this.When(/^(?:I )?POST (.*)$/, (path, callback) => {
        const uri = hydrateFromStorage(path);
        const options = {

            baseUrl: this.API_BASE_URL,
            uri,
            method:  'POST',
            qs:      this.qs || {},
            headers: this.headers || {},
        };

        if (this.body) {
            options.body = this.body;
        }

        request(options, (error, response, body) => {
            this.http = { error, response, body };
            if (error) {
                console.error(error, options); // eslint-disable-line no-console
            }

            callback();
        });
    });

    this.When(/^(?:I )?PUT (.*)$/, (path, callback) => {
        const uri = hydrateFromStorage(path);
        const options = {
            baseUrl: this.API_BASE_URL,
            uri,
            method:  'PUT',
            qs:      this.qs || {},
            headers: this.headers || {},
        };

        if (this.body) {
            options.body = this.body;
        }

        request(options, (error, response, body) => {
            this.http = { error, response, body };
            if (error) {
                console.error(error, options); // eslint-disable-line no-console
            }

            callback();
        });
    });

    this.When(/^(?:I )?DELETE (.*)$/, (path, callback) => {
        const uri = hydrateFromStorage(path);
        const options = {
            baseUrl: this.API_BASE_URL,
            uri,
            method:  'DELETE',
            qs:      this.qs || {},
            headers: this.headers || {},
        };

        request(options, (error, response, body) => {
            this.http = { error, response, body };
            if (error) {
                console.error(error, options); // eslint-disable-line no-console
            }

            callback();
        });
    });

    /* Be careful, if you want to check a 302 redirection.
     If you do a POST cucumber will not execute the redirection so you can check the 302 status.
     But if you do a GET, cucumber execute the redirection, so you can only check the href of
     the final response (see 'I should have been redirected to' step definition)*/
    this.Then(/^I should receive a ([1-5][0-9][0-9]) HTTP status code$/, (statusCode) => {
        // console.log(this.http.response.statusCode, this.http.response.body);
        expect(this).to.have.property('http');
        expect(this.http.response.statusCode).to.equal(Number(statusCode));
    });

    this.Then(/^The body response should have a property (\S+)$/, (property) => {
        expect(this.http.body).to.not.be.null;
        expect(this.http.body).to.have.property(property);
    });

    this.Then(/^The body response (.*) path should have an array with (.*) item(?:s)?$/, (path, size) => {
        expect(_.get(this.http.body, path)).to.have.property('length', Number(size));
    });

    this.Then(/^The body response should be an array with (.*) item(?:s)?$/, (size) => {
        expect(this.http.body).to.have.property('length', Number(size));
    });

    this.Then(/^I should receive a body (not )?containing (.*)$/, (isNegated, content) => {
        if (isNegated) {
            expect(this.http.response.body).to.not.contain(content);
        } else {
            expect(this.http.response.body).to.contain(content);
        }
    });

    this.Then(/^I should receive a JSON body containing (.*) at( array)? path ([^ ]+)$/, (value, isArray, path) => {
        checkJsonBody(this.http.body, path, value, !!isArray);
    });

    this.Then(/^I should receive an array at (.*) not containing (.*)$/, (path, value) => {
        return expect(_.get(this.http.body, path)).to.not.include(getValue(value));
    });

    this.Then(/^I should receive a JSON body matching (.*) at path (.*)$/, (regex, path) => {
        expect(_.get(this.http.body, path)).to.match(new RegExp(regex));
    });

    /**
     * Replaces references to a stored value by the corresponding values in a string
     * @param {string} source - the string to parse
     * @returns {string} - the string with replaced values
     */
    function hydrateFromStorage(source) {
        const parts    = source.split('((stored))');
        const lastPart = parts.pop();

        const regex         = /\w+$/;
        const hydratedParts = parts.map(part => {
            return part.replace(regex, match => {
                return self.scenarioStorage.get(match);
            });
        });

        return [...hydratedParts, lastPart].join('');
    }

    /**
     * Returns type coerced value, from storage if requested
     *
     * @param {string} value - what we expect to find
     *
     * @returns {*} found value
     */
    function getValue(value) {
        const matches = value.match(/(\w+)\(\(stored\)\)$/);

        if (!matches) {
            return coerceToType(value);
        }

        return self.scenarioStorage.get(matches[1]);
    }


    /**
     * Checks if a js object contains a given value at specified path
     *
     * @param {Object} body - the js object to check
     * @param {string} path - where to look at
     * @param {string} value - what we expect to find
     * @param {boolean} [isArray] - whether or not the tested value is an array
     *
     * @returns {undefined}
     */
    function checkJsonBody(body, path, value, isArray) {
        if (isArray) {
            return expect(_.get(body, path)).to.include(getValue(value));
        }
        expect(_.get(body, path)).to.deep.equal(getValue(value));
    }

};
