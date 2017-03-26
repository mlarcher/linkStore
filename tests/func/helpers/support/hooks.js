/**
 * This file is part of the "Linkstore" project.
 *
 * (c) 2017 - Ringabell
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */
'use strict';

module.exports = function () {
    this.Before(() => {
        // Used for API testing
        this.qs      = {};
        this.body    = {};
        this.headers = {};

        this.scenarioStorage = new Map();
    });

};
