'use strict';

const request  = require('request');
const cheerio = require('cheerio');
const joi = require('joi');

const logger = require('../core/utils/logger');
const baseDao = require('../dao/baseDao');
const validationSchemas = require('../validation/schemas');


/**
 * Link object definition.
 *
 * @typedef {Object} Link
 * @property {Date} creationDate    - the date of creation
 * @property {Date} updateDate      - the latest update date
 * @property {string} url           - the URL of the Link
 * @property {string} title         - the title of the page
 * @property {number} votes         - the number of votes
 */

/**
 * Add a link
 *
 * @param {Object} url          - the URL to add
 * @param {Object} options      - an object of options regarding the DAO
 * @returns {Promise.<Link>}    - The promise of a Link object
 */
exports.add = (url, options) => {
    const {
              error: validationError,
          } = joi.validate(url, validationSchemas.linksUrl);

    if (validationError) {
        logger.error(validationError);
        return Promise.reject(new Error('Invalid parameter'));
    }

    return new Promise((resolve, reject) => {

        return baseDao.findOne('links', { url }).then(link => {
            if (link) {
                return Promise.reject(new Error('URL is already in db'));
            }
        })
        .then(() => {
            // TOIMPROVE: use streams and abort request early if we find the title on the fly ?
            request(url, (error, response, html) => {
                if (error) {
                    return reject(new Error(`URL failed, error: ${error.message}`));
                }
                if (response.statusCode !== 200) {
                    return reject(new Error(`URL failed, statusCode: ${response.statusCode}`));
                }

                const $     = cheerio.load(html, { normalizeWhitespace: true, decodeEntities: true });
                const title = $('title').text();

                return baseDao.insert('links', { url, title, votes: 0 }, options)
                    .then(link => {
                        resolve(link);
                    })
                    .catch(reject);
            });
        })
        .catch(reject);
    });

};

exports.upVote = (args, options) => {
    return baseDao.findOne('links', args)
        .then(link => {
            if (!link) {
                return Promise.reject(new Error('Link not found'));
            }
            const updatedVotes = link.votes + 1;
            return baseDao.save('links', Object.assign(link, { votes: updatedVotes }), options);
        });
};

exports.downVote = (args, options) => {
    return baseDao.findOne('links', args)
        .then(link => {
            if (!link) {
                return Promise.reject(new Error('Link not found'));
            }
            if (link.votes < 1) {
                return link;
            }
            const updatedVotes = link.votes - 1;
            return baseDao.save('links', Object.assign(link, { votes: updatedVotes }), options);
        });
};
