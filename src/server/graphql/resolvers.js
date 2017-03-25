'use strict';

const links = [
    {
        id:   1,
        url: 'http://toto.com',
    },
    {
        id:   2,
        url: 'http://hop2.com',
    },
];

let nextId = 3;

module.exports = {
    Query:    {
        links: () => {
            return links;
        },
    },
    Mutation: {
        addLink: (root, args) => {
            const newLink = { id: nextId++, url: args.url };
            links.push(newLink);
            return newLink;
        },
    },
};
