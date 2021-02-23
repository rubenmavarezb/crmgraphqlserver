import User, { UserI } from '../models/User';
import bcryptjs from 'bcryptjs';
import jwt from 'jsonwebtoken';

require('dotenv').config({ path: 'variables.env'});

interface Input {
    input: UserI
}

interface Token {
    token: string;
}


const createToken = (user: UserI, secret: string, expiration: string) => {
    console.log(user);

    const { id, email, name, lastname } = user;

    return jwt.sign({ id, email, name, lastname }, secret, { expiresIn: expiration})
}

//Resolvers
const resolvers = {
    Query: {
        getUser: async(_:any, {token}: Token) => {

            const userId = await jwt.verify(token, process.env.SECRET!);

            return userId
        }
    },
    Mutation: {
        newUser: async (_: any, {input}:Input) => {
            
            const { email, password } = input;

            //Check if user is registrated

            const userExists = await User.findOne({email});

            if(userExists) {
                throw new Error('Mail already exists')
            }

            //Hash password
            const salt = await bcryptjs.genSalt(10);
            input.password = await bcryptjs.hash(password, salt);

            //Save user

            try {
                const user = new User(input);
                user.save();
                return user;
            } catch (error) {
                console.log(error)
            }
        },
        authenticateUser: async(_:any, {input}:Input) => {
            const { email, password } = input;

            const userExists = await User.findOne({email});

            if(!userExists) {
                throw new Error('User does not exists')
            }

            const correctPasword = await bcryptjs.compare(password, userExists.password);

            if(!correctPasword) {
                throw new Error('Password is incorrect');
            }

            return {
                token: createToken(userExists, process.env.SECRET!, '24h')
            }
        }
    }
}

export default resolvers;