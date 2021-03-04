import bcryptjs from 'bcryptjs';
import jwt from 'jsonwebtoken';
/////////////////////////////////////////////////////////////////
import User, { UserI } from '../models/User';
import Product from '../models/Product';
////////////////////////////////////////////////////////////////
import { UserInput, ProductInput, Token } from '../interfaces';
////////////////////////////////////////////////////////////////
require('dotenv').config({ path: 'variables.env'});
///////////////////////////////////////////////////////////////


const createToken = (user: UserI, secret: string, expiration: string) => {
    console.log(user);

    const { id, email, name, lastname } = user;

    return jwt.sign({ id, email, name, lastname }, secret, { expiresIn: expiration})
}

//Resolvers
const resolvers = {
    Query: {
        //User
        getUser: async(_:any, {token}: Token) => {

            const userId = await jwt.verify(token, process.env.SECRET!);

            return userId
        },
        //Products
        getProducts: async () => {
            try {
                const products = await Product.find({});

                return products;
            } catch (error) {
                console.log(error)
            }
        },
        getProduct: async (_:any, { id }:ProductInput) => {

            const product = await Product.findById(id);

            if(!product) {
                throw new Error('Product not found');
            }

            return product;
        }
    },
    Mutation: {
        //User
        newUser: async (_: any, {input}:UserInput) => {
            
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
        authenticateUser: async(_:any, {input}:UserInput) => {
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
        },
        //Product
        newProduct: async(_:any, {input}:ProductInput) => {
            try {
                const product = new Product(input);
                const result = await product.save();

                return result;
            } catch (error) {
                console.log(error)
            }
        },
        updateProduct: async (_:any, {id, input}:ProductInput) => {

            let product = await Product.findById(id);

            if(!product) {
                throw new Error('Product not found');
            }

            product = await Product.findOneAndUpdate({_id: id}, input, {new: true});

            return product;

        },
        deleteProduct: async(_:any, {id}:ProductInput) => {

            const product = await Product.findById(id);

            if(!product) {
                throw new Error('Product not found');
            }

            await Product.findOneAndDelete({_id: id});

            return "Product deleted!"
        }
    }
}

export default resolvers;