/**
 * This file is part of the "Linkstore" project.
 *
 * (c) 2017 - Ringabell
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

'use strict';

const fs = require('fs');
const path = require('path');
const _ = require('lodash');

const utils = require('./utils');
const checkMigrationFilesTools = require('./check-migration-files-tools');

const migrationFolder = `${__dirname}/../../migrations`;
const sqlFolder = 'sql';
const knexFolder = 'knex';
const tplFile = path.join(__dirname, './migration_file.tpl');

utils.removeFiles(path.join(migrationFolder, `/${knexFolder}`))
    .then(() => {
        return utils.getFiles(path.join(migrationFolder, `/${sqlFolder}`));
    })
    .then(sqlFiles => {

        checkMigrationFilesTools.checkFiles(sqlFiles);

        const promises = sqlFiles.map(file => {
            return utils.makeMigrationFile(path.join(migrationFolder, `/${knexFolder}`), `../${sqlFolder}`,
                file.replace(/\.(?:up|down)\.sql/, ''), tplFile);
        });

        return Promise.all(promises);
    })
    .then(() => {
        console.log('Done !');
        Promise.resolve();
    })
    .catch(err => {
        console.log('Error : ', err);
        process.exit(1);
    });

