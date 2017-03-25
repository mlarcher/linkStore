/**
 * This file is part of the "Linkstore" project.
 *
 * (c) 2017 - Ringabell
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

// Because we use an old version of node.js which doesn't support es6 features for now,
// we're using babel, this file is just an entry point to register babel (it must not be written in ES2015)
// and load the real API entry point file.
// This mode is used for DEV ONLY, production mode use transpiled code, see service.js.
'use strict';

require('./config.fork');
