/**
 * This file is part of the "Linkstore" project.
 *
 * (c) 2016 - Orange
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */
'use strict';

const moment   = require('moment');

const logger = require('../core/utils/logger');
const db     = require('../db');

exports.DB_DATE_FORMAT = 'YYYY-MM-DD HH:mm:ss';

/**
 * This module provides common methods to be used in the specific DAO implementations.
 * It's not tied to any context to allow easy composition.
 * It also provides transaction support using the `dbHandle` parameter for most of its functions.
 *
 * @namespace Base
 * @memberOf core.dao
 */

/**
 * Fetch a row for given table and given query.
 * Be carefull, this method doesn't handle arrays.
 *
 * @method find
 * @memberOf core.dao.Base
 * @param {string}   table             - The table name
 * @param {Object}   query             - the query to apply
 * @param {string}   columns           - the column(s) to select
 * @param {Object}   [options]                      - The options for the call
 * @param {function} [options.dbHandle]    - The db or transaction object
 * @returns {Promise.<Array.<Object>>} An array of results
 */
exports.find = (table, query, columns = '*', { dbHandle = db, orderBy = {} } = {}) => {
    const dbQuery = dbHandle.select(columns)
        .from(table)
        .modify(queryBuilder => {
            Object.keys(query).forEach(key => {
                const value = query[key];
                queryBuilder.where(key, value);
            });

            Object.keys(orderBy).forEach(field => {
                queryBuilder.orderBy(field, orderBy[field]);
            });
        });

    return dbQuery;
};

/**
 * Fetch all rows for given table.
 *
 * @method findAll
 * @memberOf core.dao.Base
 * @param {string}               table             - The table name
 * @param {string|Array.<string>} [columns=*]       - The columns to select, default to `*` (all), pass an array to
 *     restrict
 * @param {Object}   [options]                      - The options for the call
 * @param {Object} [options.dbHandle]    - The db or transaction object
 * @returns {Promise.<Array.<Object>>} An array of results
 */
exports.findAll = (table, columns = '*', { dbHandle = db } = {}) => {
    return dbHandle
        .from(table)
        .select(columns)
    ;
};

/**
 * Fetch all row between offset and offset + limit + 1 for a given table.
 * Useful for pagination, this method fetch one additional row to indicate
 * whether a next page exists or not.
 *
 * @method findAllPaginatedCursor
 * @memberOf core.dao.Base
 * @param {string}   table             - The table name
 * @param {number}   offset            - The offset to start with
 * @param {number}   limit             - The maximum number of rows to return
 * @param {Object}   [options]                      - The options for the call
 * @param {Object} [options.dbHandle]    - The db or transaction object
 * @returns {Promise.<Array.<Object>>} An array of results
 */
exports.findAllPaginatedCursor = (table, offset, limit, { dbHandle = db } = {}) => {
    return dbHandle.select('*')
        .from(table)
        .offset(Number(offset))
        .limit(Number(limit) + 1)
    ;
};

/**
 * Finds a single row for given query.
 *
 * @method findOne
 * @memberOf core.dao.Base
 * @param {string}   table             - The table name
 * @param {Object}   query             - The query object
 * @param {Object}   [options]                      - The options for the call
 * @param {Object} [options.dbHandle]    - The db or transaction object
 * @returns {Promise.<Object|null>} The result object or `null` if none found
 */
exports.findOne = (table, query, { dbHandle = db } = {}) => {
    return dbHandle(table)
        .where(query)
        .limit(1)
        .then(rows => {
            if (!rows[0]) return null;

            return rows[0];
        })
        .catch(err => {
            logger.error(err.message, { error: err });

            return Promise.reject(err);
        })
    ;
};

/**
 * Inserts a new object for given table.
 *
 * @method insert
 * @memberOf core.dao.Base
 * @param {string}   table                          - The table name
 * @param {Object}   object                         - The data object you wish to insert
 * @param {Object}   [options]                      - The options for the call
 * @param {boolean}  [options.fetch]                - If `true`, will fetch and return the created object
 * @param {boolean}  [options.timestamp]            - If `true`, will not automatically set creationDate and updateDate
 * @param {Object} [options.dbHandle]    - The db or transaction object
 * @returns {Promise.<boolean|Object>} The created object or `true` if `fetch` is `false`
 */
exports.insert = (table, object, { fetch = false, timestamp = true, dbHandle = db } = {}) => {
    let data;

    if (!timestamp) {
        data = object;
    } else {
        const now  = moment().format(exports.DB_DATE_FORMAT);
        data = Object.assign({}, {
            creationDate: now,
            updateDate: now,
        }, object);
    }

    return dbHandle(table)
        .returning('id')
        .insert(data)
        .then(id => {
            if (fetch === true) {
                return exports.findOne(table, { id }, { dbHandle });
            }

            return true;
        })
        .catch(err => {
            logger.error(err.message, { error: err });

            return Promise.reject(err.message.split(' - ')[1]);
        })
    ;
};

/**
 * Updates an object.
 *
 * @method update
 * @memberOf core.dao.Base
 * @param {string}   table                      - The table name
 * @param {number}   id                         - The object id
 * @param {Object}   patch                      - The patch data object
 * @param {Object}   [options]                      - The options for the call
 * @param {boolean}  [options.fetch]                - If `true`, will fetch and return the created object
 * @param {boolean}  [options.timestamp]            - If `true`, will not automatically set creationDate and updateDate
 * @param {Object} [options.dbHandle]    - The db or transaction object
 * @returns {Promise.<boolean|Object>} The updated object or `true` if `fetch` is `false`
 */
exports.update = (table, id, patch, { fetch = false, timestamp = true, dbHandle = db } = {}) => {
    let data;

    if (!timestamp) {
        data = patch;
    } else {
        const now = moment().format(exports.DB_DATE_FORMAT);
        data      = Object.assign({}, patch, {
            updateDate: now,
        });
    }

    return dbHandle(table)
        .where('id', id)
        .update(data)
        .then(affectedRow => {
            if (affectedRow === 0) {
                return false;
            }

            if (fetch === true) {
                return exports.findOne(table, { id }, { dbHandle });
            }

            return true;
        })
        .catch(err => {
            logger.error(err.message, { error: err });

            return Promise.reject(err);
        })
    ;
};

/**
 * Saves an object (insert or update).
 *
 * @method save
 * @memberOf core.dao.Base
 * @see core.dao.Base.insert
 * @see core.dao.Base.update
 * @param {string}   table             - The table name
 * @param {Object}   object            - The object to insert/update
 * @param {Object}   [options]                      - The options for the call
 * @param {boolean}  [options.fetch]                - If `true`, will fetch and return the created object
 * @param {Object} [options.dbHandle]    - The db or transaction object
 * @returns {Promise.<boolean|Object>} The created/updated object or `true` if `fetch` is `false`
 */
exports.save = (table, object, { fetch = false, dbHandle = db } = {}) => {

    if (!object.id) {
        return exports.insert(table, object, { dbHandle, fetch });
    }

    return exports.update(table, object.id, object, { dbHandle, fetch });
};


/**
 * Deletes an object
 *
 * @method del
 * @memberOf core.dao.Base
 * @param {string}   table             - The table name
 * @param {Object}   id                - The object id
 * @param {Object}   [options]                      - The options for the call
 * @param {Object} [options.dbHandle]    - The db or transaction object
 * @returns {Promise.<boolean>} Whether or not the deletion was successful
 */
exports.del = (table, id, { dbHandle = db } = {}) => {
    return dbHandle(table)
        .where('id', id)
        .del()
        .catch(err => {
            logger.error(err.message, { error: err });

            return Promise.reject(err);
        })
    ;
};

/**
 * returns an object by its id
 * @param {string}   table                          - The table name
 * @param {Object}   id                             - The object id
 * @param {Object}   [options]                      - The options for the call
 * @param {Object} [options.dbHandle]    - The db or transaction object
 * @returns {Promise.<Object|null>}                 - the promise of an object
 */
exports.byId = (table, id, { dbHandle = db } = {}) => {
    return dbHandle(table)
        .where('id', id)
        .limit(1) // useless because id is Unique but stays by precautions
        .then(rows => {
            if (!rows[0]) {
                return null;
            }

            return rows[0];
        });
};
