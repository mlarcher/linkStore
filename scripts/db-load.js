#!/usr/bin/env node
/**
 * This file is part of the "Linkstore" project.
 *
 * (c) 2016 - Orange
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */
'use strict';

const _        = require('lodash');
const bluebird = require('bluebird');

const seedUtils = require('../tests/commonHelpers/seedUtils');
const db        = require('../src/server/db');


exports.load = knex => {
    const links = [];

    _.range(10).forEach(i => {
        links.push(seedUtils.buildLink(i + 1));
    });

    const promisesList = [];
    promisesList.push(() => { return knex.schema.raw('ALTER TABLE links AUTO_INCREMENT = 0;'); });
    promisesList.push(() => { return knex('links').insert(links); });

    return bluebird.mapSeries(promisesList, (fn) => { return fn(); });
};

exports.reset = () => {
    console.log('emptying db'); // eslint-disable-line no-console
    seedUtils.emptyDB().then(() => {
        console.log('initializing table columns');// eslint-disable-line no-console
        return seedUtils.initTableColumns();
    }).then(() => {
        console.log('loading into database'); // eslint-disable-line no-console
        return exports.load(db)
            .then(() => {
                console.log('Seeds successfully loaded.'); // eslint-disable-line no-console
                process.exit(0);
            })
            .catch((err) => {
                console.log('\nSomething went wrong'); // eslint-disable-line no-console
                console.log(err); // eslint-disable-line no-console
                process.exit(1);
            });
    });
};

exports.reset();
