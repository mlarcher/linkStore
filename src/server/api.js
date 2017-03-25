/**
 * This file is part of the "Linkstore" project.
 *
 * (c) 2017 - Ringabell
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */
'use strict';

const express                    = require('express');
const app                        = express();
const cors                       = require('cors');
const bodyParser                 = require('body-parser');
const compress                   = require('compression');

const version = require('./resources/version');
const status = require('./resources/status');

app.set('json spaces', 2);
app.set('x-powered-by', false);

app.use(compress());
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.get('/', (req, res) => {
    res.send(`
        <h1>Linkstore API</h1>
        version:&nbsp;<a href="version">version</a>
    `);
});
app.get('/version',       version);
app.get('/status',        status);

module.exports = app;
