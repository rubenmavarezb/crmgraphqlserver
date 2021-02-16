import { ApolloServer } from 'apollo-server';
import typeDefs from './db/schema';
import resolvers from './db/resolvers';
import connectDB from './config/db';


connectDB();

const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: () => {
        const myCtx = "Helloo";

        return {
            myCtx
        }
    },
});

server.listen().then( ({url}) => {
    console.log(`Server running in URL: ${url}`)
})