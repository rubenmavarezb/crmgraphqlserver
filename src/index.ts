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
                const user = jwt.verify(token, process.env.SECRET!);
                return {
                    user
                }
            } catch (error) {
                console.log(error)
            }
        }

    }
});

server.listen().then( ({url}) => {
    console.log(`Server running in URL: ${url}`)
})