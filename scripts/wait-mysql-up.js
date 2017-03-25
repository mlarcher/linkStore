#!/usr/bin/env node
/**
 * This file is part of the "Linkstore" project.
 *
 * (c) 2017 - Ringabell
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

// This script is used in Docker based environment to check MySQL availability before starting the api
'use strict';

var config = require('../src/server/core/config');
var mysql  = require('mysql');

var currentRetries = 0;
var maxRetries     = 10;
var retryDelay     = 5000;

function tryConnect() {
    console.log('trying to connect to mysql (' + currentRetries + ')');

    var connection = mysql.createConnection({
        host:     config.get('technical.database.host'),
        database: config.get('technical.database.db'),
        user:     config.get('technical.database.user'),
        password: config.get('technical.database.pass'),
        port:     config.get('technical.database.port'),
    });
    connection.connect(function (err) {
        if (err) {
            if (currentRetries < maxRetries) {
                currentRetries++;
                setTimeout(tryConnect, retryDelay);
            } else {
                console.error('unable to connect to mysql after ' + maxRetries + ' attempts', err);
                process.exit(1);
            }

            return;
        }

        console.log('successfully connected to mysql');
        process.exit(0);
    });
}

tryConnect();
