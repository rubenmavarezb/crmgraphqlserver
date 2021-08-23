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

    type Order {
        id: ID
        order: [OrderGroup]
        total: Float
        client: ID
        seller: ID
        created: String
        state: OrderState
    }

    type OrderGroup {
        id:ID
        quantity:Int
    }

    type BestClient {
        total: Float
        client: [Client]
    }

    type BestSeller {
        total: Float
        client: [Client]
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

    input ProductOrderInput {
        id: ID
        quantity: Int
    }

    input OrderInput {
        order: [ProductOrderInput]
        total: Float
        client: ID
        state: OrderState
    }

    enum OrderState {
        PENDING
        COMPLETED
        CANCELED
    }

    type Query {
        #Users
        getUser: User

        #Products
        getProducts: [Product]
        getProduct(id: ID!): Product

        #Clients
        getClients: [Client]
        getClientsSeller: [Client]
        getClient(id: ID!): Client

        #Orders
        getOrders: [Order]
        getOrdersBySeller: [Order]
        getOrder(id: ID!): Order
        getOrdersByState(state: String!): [Order]

        #Custom search
        bestClients: [BestClient]
        bestSellers: [BestSeller]
        searchProducts(searchtext: String!): [Product]
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
        updateClient(id: ID!, input: ClientInput): Client
        deleteClient(id: ID!): String

        #Orders
        newOrder(input: OrderInput): Order
        updateOrder(id: ID!, input: OrderInput): Order
        deleteOrder(id: ID!): String
    }
`;

export default typeDefs;