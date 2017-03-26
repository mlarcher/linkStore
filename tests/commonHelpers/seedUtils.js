/**
 * This file is part of the "Linkstore" project.
 *
 * (c) 2017 - Ringabell
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */
'use strict';

const _        = require('lodash');
const bluebird = require('bluebird');
const faker    = require('faker');
const moment   = require('moment');

const config = require('../../src/server/core/config');
const db     = require('../../src/server/db');

const tables         = ['links'];
const DB_DATE_FORMAT = require('../../src/server/dao/baseDao').DB_DATE_FORMAT;


exports.load = knex => {
    const links = [];

    _.range(10).forEach(i => {
        links.push(exports.buildLink(i + 1));
    });

    const promisesList = [];
    promisesList.push(() => { return knex.schema.raw('ALTER TABLE links AUTO_INCREMENT = 0;'); });
    promisesList.push(() => { return knex('links').insert(links); });

    return bluebird.mapSeries(promisesList, (fn) => { return fn(); });
};

exports.reset = () => {
    console.log('emptying db'); // eslint-disable-line no-console
    return exports.emptyDB().then(() => {
        console.log('initializing table columns');// eslint-disable-line no-console
        return exports.initTableColumns();
    }).then(() => {
        console.log('loading into database'); // eslint-disable-line no-console
        return exports.load(db)
            .then((data) => {
                console.log('Seeds successfully loaded.'); // eslint-disable-line no-console
                return data;
            })
            .catch((err) => {
                console.log('\nSomething went wrong'); // eslint-disable-line no-console
                console.log(err); // eslint-disable-line no-console
                return Promise.reject(err);
            });
    });
};

let tableColumnNames = {};

const isNilOrFalse = arg => arg === null || arg === undefined || arg === false;

exports.initTableColumns = () => {

    if (!_.isEmpty(tableColumnNames)) {
        return Promise.resolve();
    }

    const promises = {};
    _.forEach(tables, table => {
        promises[table] = db.raw(`DESC ${table}`)
            .then(res => {
                return _.map(res[0], 'Field');
            })
        ;
    });

    return bluebird.props(promises)
        .then(result => {
            tableColumnNames = result;
        })
        ;
};

/**
 * Return a clone of the object
 * @param {Object} object to clone
 * @returns {Object} - Return a clone of the object
 */
exports.clone = object => JSON.parse(JSON.stringify(object));


const buildItemWithExtraParams = (item, attributes, itemAttributes) => {

    if (config.get('technical.testMode') === 'unitTest') {
        _.assign(item, attributes);

        return item;
    }

    const checkedAttributes = _.pick(attributes, itemAttributes);

    if (!_.isEqual(checkedAttributes, attributes)) {
        const diff = _.difference(_.keys(attributes), _.keys(checkedAttributes));
        throw new Error(`One of the extra params when building the seed is not correct: ${diff}, for this item: ${JSON.stringify(
            item)}`);
    }
    _.assign(item, checkedAttributes);

    return item;
};

const uniqData = {};
const uniq     = ([dataGenFn, ...dataGenParams], key) => {

    if (!uniqData[key]) {
        uniqData[key] = new Set();
    }
    const set = uniqData[key];

    let value;
    do {
        value = dataGenFn.apply(this, dataGenParams);
    } while (set.has(value));

    set.add(value);

    return value;
};


exports.emptyDB = () => {
    return bluebird.mapSeries([
        'links',
    ].map(table => db(table).del()), () => {});
};

exports.buildLink = (id, attributes) => {
    if (isNilOrFalse(id)) {
        throw new Error('Missing required params for building partner seed');
    }

    let link = {
        id:           id,
        creationDate: moment(faker.date.past()).format(DB_DATE_FORMAT),
        updateDate:   moment(faker.date.recent()).format(DB_DATE_FORMAT),
        url:          uniq([faker.internet.url], 'linkUrl'),
        title:        faker.lorem.sentence(),
        votes:        faker.random.number(100),
    };

    if (attributes) {
        link = buildItemWithExtraParams(link, attributes, tableColumnNames.links);
    }

    return link;
};
