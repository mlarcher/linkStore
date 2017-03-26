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
  links(url: String): [Link]
}

type Mutation {
  addLink(url: String!): Link
  upVoteLink(id:ID): Link
  downVoteLink(id:ID): Link
}
`;

module.exports = graphqlTools.makeExecutableSchema({ typeDefs, resolvers });
