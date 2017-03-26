'use strict';

const request  = require('request');
const cheerio = require('cheerio');
const joi = require('joi');

// const logger = require('../core/utils/logger');
const baseDao = require('../dao/baseDao');
const validationSchemas = require('../validation/schemas');

exports.add = (args, options) => {
    const {
              error: validationError,
          } = joi.validate(args, validationSchemas.links);

    if (validationError) {
        return Promise.reject(new Error('Invalid parameter'));
    }

    return new Promise((resolve, reject) => {

        return baseDao.findOne('links', args).then(link => {
            if (link) {
                return Promise.reject(new Error('URL is already in db'));
            }
        })
        .then(() => {
            // TOIMPROVE: use streams and abort request early if we find the title on the fly ?
            request(args.url, (error, response, html) => {
                if (error || response.statusCode !== 200) {
                    reject(new Error(`URL failed, statusCode: ${response.statusCode}`));
                }

                const $     = cheerio.load(html, { normalizeWhitespace: true, decodeEntities: true });
                const title = $('title').text();

                return baseDao.insert('links', { url: args.url, title }, options).then(link => {
                    resolve(link);
                }).catch(reject);
            });
        })
        .catch(reject);
    });

};

exports.upVote = (args, options) => {
    return baseDao.byId('links', args)
        .then(link => {
            const updatedVotes = link.votes + 1;
            return baseDao.save('links', Object.assign(link, { votes: updatedVotes }), options);
        });
};

exports.downVote = (args, options) => {
    return baseDao.byId('links', args)
        .then(link => {
            if (link.votes < 1) {
                return link;
            }
            const updatedVotes = link.votes - 1;
            return baseDao.save('links', Object.assign(link, { votes: updatedVotes }), options);
        });
};
