/**
 * This file is part of the "Linkstore" project.
 *
 * (c) 2017 - Ringabell
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */
'use strict';

const knex     = require('knex');
const mockKnex = require('mock-knex');
const config   = require('./core/config');

let connection;

const tinyToBooleanCast = (field, next) => {

    if (field.type === 'TINY' && field !== null && field.length === 1) {
        const value = field.string();
        return value ? (value === '1') : null;
    }

    return next();
};

if (config.get('technical.testMode') === 'unitTest') {
    connection = knex({
        client: 'mysql',
        debug:  config.get('technical.database.verbose'),
    });

    mockKnex.mock(connection, 'knex@0.10');
} else {
    connection = knex({
        client:     'mysql',
        debug:      config.get('technical.database.verbose'),
        connection: {
            host:     config.get('technical.database.host'),
            user:     config.get('technical.database.user'),
            password: config.get('technical.database.pass'),
            database: config.get('technical.database.db'),
            port:     config.get('technical.database.port'),
            typeCast: tinyToBooleanCast,
        },
    });
}

module.exports = connection;
