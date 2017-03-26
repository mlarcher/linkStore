'use strict';

// const logger = require('../core/utils/logger');
const baseDao = require('../dao/baseDao');

exports.add = (args, options) => {
    // TODO: add Joi URL validation
    return baseDao.insert('links', args, options);
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
