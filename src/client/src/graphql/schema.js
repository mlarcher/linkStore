export const typeDefs = `
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
`;
