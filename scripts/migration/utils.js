/**
 * This file is part of the "Linkstore" project.
 *
 * (c) 2017 - Ringabell
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

'use strict';


const fs   = require('fs');
const path = require('path');
const _    = require('lodash');

exports.resolvePath = (migrationFolder) => {
    return new Promise((resolve, reject) => {
        fs.realpath(migrationFolder, (err, path) => {
            if (err) {
                return reject(err);
            }
            resolve(path);
        });
    });
};

exports.getFiles = (folder) => {
    return new Promise((resolve, reject) => {
        fs.readdir(folder, (err, files) => {
            if (err) {
                return reject(err);
            }
            resolve(files);
        })
    })
};

exports.rmFile = (file) => {
    return new Promise((resolve, reject) => {
        fs.unlink(file, (err) => {
            if (err) {
                return reject(err);
            }
            resolve();
        })
    })
};

exports.removeFiles = (folder) => {
    return exports.getFiles(folder)
        .then((files) => {
            const promises = [];
            _.forEach(files, function (file) {
                if (file !== '.keep') {
                    promises.push(exports.rmFile(path.join(folder, `/${file}`)))
                }
            });

            return Promise.all(promises);
        });
};

exports.readFile = (file) => {
    return new Promise((resolve, reject) => {
        fs.readFile(file, (err, content) => {
            if (err) {
                return reject(err);
            }
            resolve(content);
        });
    });
};

exports.writeFile = (file, content) => {
    return new Promise((resolve, reject) => {
        fs.writeFile(file, content, (err) => {
            if (err) {
                return reject(err);
            }
            resolve();
        });
    });
};

exports.makeMigrationFile = (knexFolder, relativeSqlFolder, filename, templateFile) => {
    return exports.readFile(templateFile)
        .then((template) => {
            const content    = template.toString().replace('FIlENAME', filename).replace('FOLDER', relativeSqlFolder);
            const outputFile = path.join(knexFolder, `/${filename}.js`);

            return exports.writeFile(outputFile, content);
        })
};


