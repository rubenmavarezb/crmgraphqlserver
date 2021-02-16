import { gql } from 'apollo-server';

//Schema
const typeDefs = gql`

    type Query {
        getCourses: String
    }
`;

export default typeDefs;