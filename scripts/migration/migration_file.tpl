/**
 * This file is part of the "Linkstore" project.
 *
 * (c) 2017 - Ringabell
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

'use strict';

const path = require('path');
const fs = require('fs');

const filename = 'FIlENAME';
const folder = 'FOLDER';

/**
 * @param {Object} knex      - the knex instance
 * @param {string} operation - can be 'up' or 'down'
 * @returns {Promise} a promise
 */
const loadSQLFile = (knex, operation) => {
    const file = path.join(__dirname, `/${folder}`, `/${filename}.${operation}.sql`);

    return new Promise((resolve, reject) => {
        fs.readFile(file, (err, content) => {
            if (err) return reject(err);
            const result = knex.schema.raw(content.toString().replace(/\n/g, '').replace(/\t/g, ' '));
            resolve(result);
        });
    });
};

/**
 * Migration upgrade.
 *
 * @param {Object} knex - the knex instance
 * @returns {Promise} the promise to execute to run the migration up
 */
exports.up = (knex) => {
    return loadSQLFile(knex, 'up');
};

/**
 * Migration downgrade.
 *
 * @param {Object} knex - the knex instance
 * @returns {Promise} the promise to execute to run the migration down
 */
exports.down = (knex) => {
    return loadSQLFile(knex, 'down');
};
