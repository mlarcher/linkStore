'use strict';

const baseDao = require('../dao/baseDao');
// const logger = require('../core/utils/logger');
const linksService = require('../services/linksService');

module.exports = {
    Query:    {
        links: (root, args) => {
            return baseDao.find('links', args, undefined, { orderBy: { votes: 'desc' } });
        },
    },
    Mutation: {
        addLink: (root, args) => {
            return linksService.add(args.url, { fetch: true });
        },
        upVoteLink: (root, args) => {
            return linksService.upVote(args, { fetch: true });
        },
        downVoteLink: (root, args) => {
            return linksService.downVote(args, { fetch: true });
        },
    },
};
