import { ApolloServer } from 'apollo-server';
import jwt from 'jsonwebtoken';
//////////////////////////////////////////////
import typeDefs from './db/schema';
import resolvers from './db/resolvers';
/////////////////////////////////////////////
import connectDB from './config/db';
/////////////////////////////////////////////
require('dotenv').config({ path: 'variables.env'});
///////////////////////////////////////////////////////////////


connectDB();

const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: ({req}) => {
        // console.log(req.headers['authorization'])

        const token = req.headers['authorization'] || '';

        if(token) {
            try {
                const user = jwt.verify(token.replace('Bearer ', ''), process.env.SECRET!);
                return {
                    user
                }
            } catch (error) {
                console.log(error)
            }
        }

    }
});

server.listen({ port: process.env.PORT || 4000 }).then( ({url}) => {
    console.log(`Server running in URL: ${url}`)
})