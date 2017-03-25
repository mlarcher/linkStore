/**
 * This file is part of the "Linkstore" project.
 *
 * (c) 2017 - Ringabell
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

'use strict';

const config = require('../../../../src/server/core/config');

/**
 * This file is used to check that defined env variables are populated in
 * config module. It takes a config key as an argument and output the corresponding
 * value
 */

const key = process.argv[2];
if (process.env.FORK === 'true') console.log(config.get(key)); // eslint-disable-line no-console
