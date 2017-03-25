/**
 * This file is part of the "Linkstore" project.
 *
 * (c) 2017 - Ringabell
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */
'use strict';

const logger = require('../../core/utils/logger');

module.exports = (fn, ...args) => {
    const lastArg = args[args.length - 1];

    if (typeof lastArg === 'function') {
        args.pop();
        logger.warn('Callbacks are not handled by promisify');
    }

    return new Promise((resolve, reject) => {
        fn(...args, (err, data) => {
            if (err) {
                return reject(err);
            }
            return resolve(data);
        });
    });
};
