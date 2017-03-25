/**
 * This file is part of the "Linkstore" project.
 *
 * (c) 2017 - Ringabell
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */
'use strict';

const logger      = require('./core/utils/logger');
const config      = require('./core/config');
const CoreCluster = require('./core/cluster');
const api         = require('./api');
const db          = require('./db');


const server = api.listen(config.get('technical.port'), () => {
    const host = server.address().address;
    const port = server.address().port;
    logger.info(`API listening at http://${host}:${port}`);
});

const shutdown = signal => {
    logger.debug(`received kill signal (${signal}), shutting down gracefully`);

    server.close(() => {
        db.destroy(() => {
            logger.debug('finished graceful shutdown');
            process.exit(0);
        });
    });
};

['SIGTERM', 'SIGINT'].forEach(signal => {
    process.on(signal, () => {
        shutdown(signal);
    });
});

process.on('message', message => {
    if (message === CoreCluster.MESSAGE_GRACEFUL) {
        shutdown('IPC_MESSAGE');
    }
});
