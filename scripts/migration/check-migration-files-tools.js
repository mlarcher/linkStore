#!/usr/bin/env node

/**
 * This file is part of the "Linkstore" project.
 *
 * (c) 2017 - Ringabell
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */
'use strict';

var _ = require('lodash');

function checkFiles(files) {
    var sqlDownFiles = [];
    var sqlUpFiles = [];

    var regex = /^(\d{12}_.*)\.(up|down)\.sql$/;

    files.forEach(function (sqlFile) {

        var migrationTypeMatch = sqlFile.match(regex);
        if (!migrationTypeMatch) {
            throw new RangeError(sqlFile + ' name is malformed. It should end with .up.sql or .down.sql'
                                               + ' and be prefixed by the date.');
        }
        var name = migrationTypeMatch[1];
        var direction = migrationTypeMatch[2];

        if (direction === 'down') {
            sqlDownFiles.push(name);
        } else {
            sqlUpFiles.push(name);
        }
    });

    var differences = _.difference(sqlDownFiles, sqlUpFiles).concat(_.difference(sqlUpFiles, sqlDownFiles));
    if (differences.length) {
        throw new Error('Some migration files do not have both an "up" and a "down" version:\n' + differences.join(', \n') + '\n');
    }

    sqlDownFiles.forEach(function (name) {
        var datePart = name.split('_')[0];
        var year = datePart.substring(0, 4);
        var month = datePart.substring(4, 6);
        var day = datePart.substring(6, 8);
        var hour = datePart.substring(8, 10);
        var min = datePart.substring(10);
        var date = new Date(year, month - 1, day, hour, min);
        var now = new Date();
        now.setHours(now.getHours() + 12);


        if (now.getTime() < date.getTime()) {
            throw new RangeError('The date for migration file "' + name + '" should be in the past.');
        }
    });
}

module.exports.checkFiles = checkFiles;
