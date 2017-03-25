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
var fs = require('fs');

var checkMigrationFilesTools = require('./check-migration-files-tools');

var files = fs.readdirSync('migrations/sql');
checkMigrationFilesTools.checkFiles(files);
