'use strict';

const graphqlTools = require('graphql-tools');

const resolvers = require('./resolvers');

const typeDefs = `
type Link {
  id: ID!
  creationDate: String
  updateDate: String
  url: String!
  title: String
  votes: Int
}

type Query {
  links: [Link]
}

type Mutation {
  addLink(url: String!): Link
}
`;

module.exports = graphqlTools.makeExecutableSchema({ typeDefs, resolvers });
