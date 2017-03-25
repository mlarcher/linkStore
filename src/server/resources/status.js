/**
 * This file is part of the "Linkstore" project.
 *
 * (c) 2017 - Ringabell
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */
'use strict';

const pkg = require('../../../package.json');


module.exports = (req, res) => {
    const output = {
        status:  'ok',
        version: pkg.version,
        uptime:  `${process.uptime()} second(s)`,
    };
    res.send(output);
};
