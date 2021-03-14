import bcryptjs from 'bcryptjs';
import jwt from 'jsonwebtoken';
/////////////////////////////////////////////////////////////////
import User, { UserI } from '../models/User';
import Product from '../models/Product';
import Client from '../models/Client';
////////////////////////////////////////////////////////////////
import { UserInput, ProductInput, ClientInput, Token, UserCtx } from '../interfaces';
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
        getUser: async(_:null, {token}: Token) => {

            const userId = jwt.verify(token, process.env.SECRET!);

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
        getProduct: async (_:null, { id }:ProductInput) => {

            const product = await Product.findById(id);

            if(!product) {
                throw new Error('Product not found');
            }

            return product;
        },
        //Clients
        getClients: async () => {
            try {
                const clients = await Client.find({});
                return clients
            } catch (error) {
                console.log(error)
            }
        },
        getClientsSeller: async (_: null, {}, ctx: UserCtx) => {
            try {
                const clients = await Client.find({ seller: ctx.user.id.toString() })
                return clients
            } catch (error) {
                console.log(error)
            }
        },
        getClient: async (_:null, {id}: ClientInput, ctx: UserCtx ) => {
            const client = await Client.findById(id);

            if(!client) {
                throw new Error('Client does not exists')
            }

            if(client.seller.toString() !== ctx.user.id) {
                throw new Error("You don't have permissions")
            }

            return client
        }
    },
    Mutation: {
        //User - Seller
        newUser: async (_: null, {input}:UserInput) => {
            
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
        authenticateUser: async(_:null, {input}:UserInput) => {
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
        newProduct: async(_:null, {input}:ProductInput) => {
            try {
                const product = new Product(input);
                const result = await product.save();

                return result;
            } catch (error) {
                console.log(error)
            }
        },
        updateProduct: async (_:null, {id, input}:ProductInput) => {

            let product = await Product.findById(id);

            if(!product) {
                throw new Error('Product not found');
            }

            product = await Product.findOneAndUpdate({_id: id}, input, {new: true});

            return product;

        },
        deleteProduct: async(_:null, {id}:ProductInput) => {

            const product = await Product.findById(id);

            if(!product) {
                throw new Error('Product not found');
            }

            await Product.findOneAndDelete({_id: id});

            return "Product deleted!"
        },
        //Client
        newClient: async(_:null, {input}:ClientInput, ctx: UserCtx) => {

            const { email } = input;

            const client = await Client.findOne({ email });

            if(client) {
                throw new Error('Client already exists');
            }

            const newClient = new Client(input);

            newClient.seller = ctx.user.id;


            try {
                const result = await newClient.save();
    
                return result; 
            } catch (error) {
                console.log(error)
            }

        },
        updateClient: async (_:null, {id, input}:ClientInput, ctx: UserCtx) => {
            let client = await Client.findById(id);

            if(!client) {
                throw new Error('The client you are looking for does not exists in our database');
            }

            if(client.seller.toString() !== ctx.user.id) {
                throw new Error("You don't have permissions")
            }

            client = await Client.findOneAndUpdate({_id: id}, input, {new: true})
        },
        deleteClient: async (_:null, {id}:ClientInput, ctx: UserCtx) => {
            let client = await Client.findById(id);

            if(!client) {
                throw new Error('The client you are looking for does not exists in our database');
            }

            if(client.seller.toString() !== ctx.user.id) {
                throw new Error("You don't have permissions")
            }

            await Client.findOneAndDelete({_id: id});

            return "Client deleted";
        }
    }
}

export default resolvers;