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

const seedUtils = require('../tests/commonHelpers/seedUtils');

seedUtils.reset().then(() => {
    process.exit(0);
}).catch((err) => {
    process.exit(1);
});
