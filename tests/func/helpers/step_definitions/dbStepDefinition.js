/**
 * This file is part of the "Linkstore" project.
 *
 * (c) 2017 - Ringabell
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */
'use strict';

const chai   = require('chai');
const expect = chai.expect;
const moment = require('moment');
const _      = require('lodash');

const db      = require('../../../../src/server/db.js');
const helpers = require('../tools.js');

module.exports = function () {

    this.Then(/^table (.*) should have the following fields where (.*) is (.*)$/, (tableName, queryField, testValue, step, callback) => {
        const fields = step.rowsHash();

        const coercedTestValue = helpers.coerceToType(testValue);

        db.from(tableName)
            .where({ [`${tableName}.${queryField}`]: coercedTestValue })
            .options({ nestTables: true })
            .limit(1)
            .then(result => {
                expect(result).to.be.an.array;
                const dbItem = result[0][tableName];

                Object.keys(fields).forEach(key => {

                    const value = helpers.coerceToType(fields[key]);

                    if (_.isDate(dbItem[key])) {
                        expect(moment(dbItem[key]).format('YYYY-MM-DD'))
                            .to.equal(moment(value).format('YYYY-MM-DD'));
                    } else {
                        expect(dbItem[key]).to.be.equal(helpers.coerceToType(fields[key]));
                    }
                });

                callback();
            })
            .catch(callback);
    });

    this.Then(
        /^table ([^ ]*) should (not )?have field ([^ ]*) with value (matching )?(.*) where ([^ ]*) is ([^ ]*)$/,
        (tableName, isNegated, testedFieldName, isMatching, testValue, queryFieldName, queryValue, callback) => {

            let coercedTestValue;
            if (!isMatching) {
                coercedTestValue = helpers.coerceToType(testValue);
            }
            const coercedQueryValue = helpers.coerceToType(queryValue);

            db.from(tableName)
                .where({ [`${tableName}.${queryFieldName}`]: coercedQueryValue })
                .options({ nestTables: true })
                .limit(1)
                .then(result => {
                    expect(result).to.be.an.array;

                    if (isNegated) {
                        if (isMatching) {
                            expect(result[0][tableName][testedFieldName]).not.to.match(new RegExp(testValue));
                        } else {
                            expect(result[0][tableName][testedFieldName]).not.to.equal(coercedTestValue);
                        }
                    } else {
                        if (isMatching) {
                            expect(result[0][tableName][testedFieldName]).to.match(new RegExp(testValue));
                        } else {
                            if (_.isDate(coercedTestValue)) {
                                expect(moment(result[0][tableName][testedFieldName]).format('YYYY-MM-DD'))
                                    .to.equal(moment(coercedTestValue).format('YYYY-MM-DD'));
                            } else {
                                expect(result[0]).not.to.be.empty;
                                expect(result[0][tableName][testedFieldName]).to.equal(coercedTestValue);
                            }
                        }
                    }
                    callback();
                })
                .catch(callback);
        }
    );

    this.Then(
        /^table ([^ ]*) should match the following table where ([^ ]*) is ([^ ]*)$/,
        (tableName, queryFieldName, queryValue, table, callback) => {

            const coercedQueryValue = helpers.coerceToType(queryValue);
            db.from(tableName)
                .where({ [`${tableName}.${queryFieldName}`]: coercedQueryValue })
                .options({ nestTables: true })
                .limit(1)
                .then(result => {
                    expect(result).to.be.an.array;

                    const row = result[0];
                    expect(row).not.to.be.empty;

                    const rowsHash = table.rowsHash();
                    Object.keys(rowsHash).forEach(key => {
                        const value = rowsHash[key];
                        const coercedValue = helpers.coerceToType(value);
                        expect(row[tableName][key]).to.equal(coercedValue);
                    });

                    callback();
                })
                .catch(callback);

        }
    );

    this.Then(
        /^table ([^ ]*) should find (\d+) result(?:s)? where ([^ ]*) is ([^ ]*)$/,
        (tableName, nbOfResults, queryFieldName, queryValue, callback) => {

            db.count('id')
                .from(tableName)
                .where(`${tableName}.${queryFieldName}`, 'like', `${queryValue}`)
                .then(result => {
                    expect(result).to.be.an.array;
                    expect(result[0]).to.be.defined;
                    expect(result[0]['count(`id`)']).to.equal(Number(nbOfResults));
                    callback();
                })
                .catch(callback);
        }
    );

    this.Then(
        /^table ([^ ]*) should find (\d+) result(?:s)? where ([^ ]*) is ([^ ]*) and where ([^ ]*) is ([^ ]*)$/,
        (tableName, nbOfResults, queryFieldName, queryValue, secondQueryFieldName, secondQueryValue, callback) => {

            const coercedQueryValue = helpers.coerceToType(queryValue);
            const coercedSecondQueryValue = helpers.coerceToType(secondQueryValue);

            db.from(tableName)
                .where({ [`${tableName}.${queryFieldName}`]: coercedQueryValue })
                .andWhere({ [`${tableName}.${secondQueryFieldName}`]: coercedSecondQueryValue })
                .then(result => {
                    expect(result).to.be.an.array;
                    expect(result).to.have.lengthOf(nbOfResults);
                    callback();
                })
                .catch(callback);
        }
    );

    this.Then(
        /^table ([^ ]*) should have field ([^ ]*) (not )?null where ([^ ]*) is ([^ ]*)$/,
        (tableName, testedFieldName, isNotNull, queryFieldName, queryValue, callback) => {

            const coercedQueryValue = helpers.coerceToType(queryValue);

            db.from(tableName)
                .where({ [`${tableName}.${queryFieldName}`]: coercedQueryValue })
                .options({ nestTables: true })
                .limit(1)
                .then(result => {
                    expect(result).to.be.an.array;
                    if (isNotNull) {
                        expect(result[0][tableName][testedFieldName]).to.not.be.empty;
                    } else {
                        expect(result[0][tableName][testedFieldName]).to.be.null;
                    }

                    callback();
                })
                .catch(callback);
        }
    );
};
