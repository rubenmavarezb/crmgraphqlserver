import { gql } from 'apollo-server';
////////////////////////////////////

//Schema
const typeDefs = gql`

    type User {
        id: ID
        name: String
        lastname: String
        email: String
        created: String
    }

    type Token {
        token: String
    }

    type Product {
        id: ID
        name: String
        stock: Int
        price: Float
        created: String
    }

    type Client {
        id: ID
        name: String
        lastname: String
        company: String
        email: String
        phone: String
        seller: ID
    }

    input UserInput {
        name: String!
        lastname: String!
        email: String!
        password: String!
    }

    input ProductInput {
        name: String!
        stock: Int!
        price: Float!
    }

    input AuthenticateInput {
        email: String!
        password: String!
    }

    input ClientInput {
        name: String!
        lastname: String!
        company: String!
        email: String!
        phone: String
    }

    type Query {
        #Users
        getUser(token: String!): User

        #Products
        getProducts: [Product]
        getProduct(id: ID!): Product

        #Clients
        getClients: [Client]
        getClientsSeller: [Client]
        getClient(id: ID!): Client
    }

    type Mutation {
        #Users
        newUser(input: UserInput): User
        authenticateUser(input: AuthenticateInput): Token

        #Products
        newProduct(input: ProductInput): Product
        updateProduct(id: ID!, input: ProductInput): Product
        deleteProduct(id: ID!): String

        #Clients
        newClient(input: ClientInput): Client
        updateClient(input: ClientInput): Client
        deleteClient(id: ID!): String
    }
`;

export default typeDefs;