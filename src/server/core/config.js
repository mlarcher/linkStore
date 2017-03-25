/**
 * This file is part of the "Linkstore" project.
 *
 * (c) 2017 - Ringabell
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */
'use strict';
const _   = require('lodash');
const path   = require('path');

/**
 * @namespace config
 * @memberOf core
 */

const cfg = {};

/**
 * Get a value from the configuration. Supports dot notation (eg: "key.subkey.subsubkey")...
 *
 * @method get
 * @memberOf core.config
 * @param {string} key - Key. Support dot notation.
 * @returns {*} value
 */
exports.get = (key) => {
    if (!key) {
        return cfg;
    }
    return _.get(cfg, key);
};

/**
 * Set a value in the configuration. Supports dot notation (eg: "key.subkey.subsubkey")
 * and array notation (eg: "key.subkey[0].subsubkey").
 *
 * @method set
 * @memberOf core.config
 * @param {string} key   - Key. Support dot notation.
 * @param {Object} value - value. If null or undefined, key is removed.
 * @returns {undefined}
 */
exports.set = (key, value) => {
    if (_.isUndefined(value) || _.isNull(value)) {
        _.unset(cfg, key);
    } else {
        _.set(cfg, key, value);
    }
};

/**
 * Dumps the whole config object.
 *
 * @method dump
 * @memberOf core.config
 * @returns {Object} The whole config object
 */
exports.dump = () => {
    return cfg;
};

/**
 * Return the source value if it is an array
 * This function is used to customize the default output of _.mergeWith
 *
 * @param {*} objValue: the target field content
 * @param {*} srcValue: the new value
 * @returns {*}: return what we want as a value, or undefined to let the default behaviour kick in
 */
const customizer = (objValue, srcValue) => {
    if (_.isArray(srcValue)) return srcValue;
};


// Load initial configuration
const techCfgPath = '../../../conf/technical';


const techBaseConf = require('../../../conf/technical/base.json');

let applicationEnvironment;
if (process.env.APP_ENV) {
    // we have an explicit APP_ENV set
    applicationEnvironment = process.env.APP_ENV;
} else {
    // no APP_ENV fallback to local
    applicationEnvironment = 'local';
}

// load environment specific configurations
const techOverrideConf = require(`${techCfgPath}/config-tech.${applicationEnvironment}.json`);

const techCfg = _.merge({}, techBaseConf, techOverrideConf, customizer);

exports.set('technical', techCfg);

// because we had to use those values before we do not use mapping
exports.set('technical.techCfgPath', techCfgPath);
exports.set('technical.appEnv', applicationEnvironment);

// Read env values

// defines mapping between env variables and config keys
const envMapping = {
    API_BASE_URL:         'technical.apiBaseUrl',
    MYSQL_WRITE_HOST:     'technical.database.host',
    MYSQL_WRITE_USER:     'technical.database.user',
    MYSQL_WRITE_PASSWORD: 'technical.database.pass',
    MYSQL_WRITE_SCHEMA:   'technical.database.db',
    MYSQL_WRITE_PORT:     'technical.database.port',
    TEST_MODE:            'technical.testMode',
    ASSETS_PATH:          'technical.assetsPath',
};

// iterates on env mapping and assign env var value if available
_.forOwn(envMapping, (value, key) => {
    if (process.env[key]) {
        exports.set(value, process.env[key]);
    }
});

// always use absolute path
exports.set('technical.assetsPath', path.resolve(exports.get('technical.assetsPath')));

