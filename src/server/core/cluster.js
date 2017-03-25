/**
 * This file is part of the "Linkstore" project.
 *
 * (c) 2017 - Ringabell
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */
'use strict';
const config = require('./config');
const logger = require('../core/utils/logger');

/**
 * @namespace cluster
 * @memberOf core
 */

/**
 * Used for IPC messaging, notify a cluster worker for graceful shutdown.
 *
 * @const
 * @memberOf core.cluster
 * @type {string}
 */
exports.MESSAGE_GRACEFUL = 'graceful_shutdown';

/**
 * Used for IPC messaging, notify master for reload.
 *
 * @const
 * @memberOf core.cluster
 * @type {string}
 */
exports.MESSAGE_RELOAD   = 'reload';


exports.forkWorker = cluster => cluster.fork()
    .on('error', err => {
        logger.error(err.message, { error: err });
    })
    .on('message', message => {
        if (message === exports.MESSAGE_RELOAD) {
            exports.reload(cluster);
        }
    })
;


/**
 * @method initMaster
 * @memberOf core.cluster
 * @param {Object} cluster     - The cluster module
 * @param {number} workerCount - The number of workers you wish to create
 * @returns {undefined}
 */
exports.initMaster = (cluster, workerCount) => {
    cluster.on('fork', worker => {
        logger.debug(`cluster worker ${worker.id} with pid ${worker.process.pid} started`);
    });

    cluster.on('listening', (worker, address) => {
        logger.debug(`cluster worker ${worker.id} with pid ${worker.process.pid} listening on ${address.address}:${address.port}`);
    });

    cluster.on('exit', (worker, code) => {
        logger.debug(`cluster worker ${worker.id} with pid ${worker.process.pid} died (${code})`);

        // only restart if worker process exited abnormally
        if (code !== 0) {
            exports.forkWorker(cluster);
        }
    });

    for (let i = 0; i < workerCount; i += 1) {
        exports.forkWorker(cluster);
    }
};


let reloading = false;

/**
 * @method initMaster
 * @memberOf core.cluster
 * @param {Object} cluster - The cluster module
 * @returns {undefined}
 */
exports.reload = cluster => {
    if (reloading) {
        logger.warn('already restarting workers, skipping');
        return;
    }

    reloading = true;
    logger.debug('restarting cluster workers');

    let currentWorkerIndex = 0;
    const workersIds = Object.keys(cluster.workers);

    const restartWorker = () => {
        if (currentWorkerIndex === workersIds.length) {
            logger.debug(`all cluster workers have been restarted (${workersIds.length} worker(s))`);
            reloading = false;
            return;
        }

        const workerId        = workersIds[currentWorkerIndex];
        const condemnedWorker = cluster.workers[workerId];

        if (condemnedWorker === undefined) {
            logger.warn(`worker ${workerId} already dead`);
            currentWorkerIndex++;
            restartWorker();
            return;
        }

        logger.debug(`killing worker ${workerId} with pid ${condemnedWorker.process.pid}`);

        const gracefulTimeoutHandler = setTimeout(() => {
            logger.error('could not shutdown worker gracefully, forcing shutdown');
            condemnedWorker.kill();
        }, config.get('technical.shutdownTimeout'));

        condemnedWorker.once('disconnect', () => {
            logger.debug(`worker ${workerId} with pid ${condemnedWorker.process.pid} disconnected`);
            clearTimeout(gracefulTimeoutHandler);
        });

        condemnedWorker.send(exports.MESSAGE_GRACEFUL);
        condemnedWorker.disconnect();

        exports.forkWorker(cluster)
            .once('listening', () => {
                logger.debug(`worker ${workerId} replaced`);
                currentWorkerIndex++;
                restartWorker();
            })
        ;
    };

    restartWorker();
};
