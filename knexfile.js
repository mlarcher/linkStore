/**
 * This file is part of the "Linkstore" project.
 *
 * (c) 2017 - Ringabell
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */
'use strict';
const config = require('./src/server/core/config'); // eslint-disable-line no-var, vars-on-top


module.exports = {
    development: {
        client:     'mysql',
        connection: {
            host:     config.get('technical.database.host'),
            database: config.get('technical.database.db'),
            user:     config.get('technical.database.user'),
            password: config.get('technical.database.pass'),
            port:     config.get('technical.database.port'),
        },
        pool: {
            min: 2,
            max: 10,
        },
        migrations: {
            tableName: 'knex_migrations',
            directory: './migrations/knex',
        },
    },
};
