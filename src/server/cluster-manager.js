/**
 * This file is part of the "Linkstore" project.
 *
 * (c) 2017 - Ringabell
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */
'use strict';
const cluster     = require('cluster');
const os          = require('os');
const CoreCluster = require('./core/cluster');
const logger      = require('./core/utils/logger');

const workersCount = (process.env.WORKERS) ? parseInt(process.env.WORKERS, 10) : os.cpus().length;

if (cluster.isMaster) {
    logger.debug(`cluster master started (${process.pid})`);

    CoreCluster.initMaster(cluster, workersCount);

    process.on('SIGHUP', () => {
        CoreCluster.reload(cluster);
    });
} else {
    require('./index'); // eslint-disable-line global-require
}
