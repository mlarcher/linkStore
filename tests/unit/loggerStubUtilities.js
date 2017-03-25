/**
 * This file is part of the "CloudPro" project.
 *
 * (c) 2016 - Orange
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */
'use strict';

const sinon  = require('sinon');
const logger = require('../../src/server/core/utils/logger');

let debug;
let info;
let warn;
let error;

exports.stubLogger = () => {
    sinon.stub(logger, 'debug', () => {});
    sinon.stub(logger, 'info', () => {});
    sinon.stub(logger, 'warn', () => {});
    sinon.stub(logger, 'error', () => {});
};

exports.restoreLogger = () => {
    logger.debug.restore();
    logger.info.restore();
    logger.warn.restore();
    logger.error.restore();
};

exports.loggerSpy = () => {
    debug = sinon.spy();
    info  = sinon.spy();
    warn  = sinon.spy();
    error = sinon.spy();

    return {
        debug,
        info,
        warn,
        error,
    };
};

exports.resetSpy =
    () => (
        {
            debug: debug.reset(),
            info:  info.reset(),
            warn:  warn.reset(),
            error: error.reset(),
        }
    );
