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

const pkg = require('../../../package.json');

/**
 * Return a json describing the current version
 *
 * @param {Object}   req  - express request
 * @param {Object}   res  - express response
 * @param {function} next - express next
 * @returns {undefined}
 */
module.exports = (req, res) => {
    const baseInfos = {
        name: pkg.name,
    };

    fs.readFile(`${__dirname}/../../../revision.json`, (err, revisionData) => {
        if (err) {
            return res.send(baseInfos);
        }

        // get data from revision file
        try {
            const revision      = JSON.parse(revisionData);
            revision.commitDate = new Date(revision.commitDate).toISOString();
            revision.buildDate  = new Date(revision.buildDate).toISOString();

            const version = Object.assign({}, baseInfos, revision);

            res.json(version);
        } catch (e) {
            res.send(baseInfos);
        }

    });
};
