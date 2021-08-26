import bcryptjs from 'bcryptjs';
import jwt from 'jsonwebtoken';
/////////////////////////////////////////////////////////////////
import User, { UserI } from '../models/User';
import Product, {ProductI} from '../models/Product';
import Client from '../models/Client';
import Order from '../models/Order';
////////////////////////////////////////////////////////////////
import { UserInput,
        ProductInput, 
        ClientInput, 
        OrderInput, 
        Token, 
        UserCtx, 
        ProductOrderI } from '../interfaces';
////////////////////////////////////////////////////////////////
require('dotenv').config({ path: 'variables.env'});
///////////////////////////////////////////////////////////////


const createToken = (user: UserI, secret: string, expiration: string) => {

    const { id, email, name, lastname } = user;

    return jwt.sign({ id, email, name, lastname }, secret, { expiresIn: expiration})
}

//Resolvers
const resolvers = {
    Query: {
        //User
        getUser: async(_:null, {}, ctx:UserCtx) => {
            return ctx.user;
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
        },
        //Orders
        getOrders: async () => {
            try {
                const orders = await Order.find({});
                return orders;
            } catch (error) {
                console.log(error)
            }
        },
        getOrdersBySeller: async(_:null, {}, ctx: UserCtx) => {
            try {
                const orders = await Order.find({ seller: ctx.user.id }).populate('client');
                return orders
            } catch (error) {
                console.log(error)
            }
        },
        getOrder: async(_:null, {id}: OrderInput, ctx: UserCtx) => {
            const order = await Order.findById(id);

            if(!order) {
                throw new Error("Order not found");
            }

            if(order.seller.toString() !== ctx.user.id) {
                throw new Error('Access denied');
            }

            return order
        },
        getOrdersByState: async (_:null, { state }:OrderInput, ctx: UserCtx) => {

            const orders = await Order.find({ seller: ctx.user.id, state });

            return orders;
        },
        //Custom searchs
        bestClients: async() => {
            const clients = await Order.aggregate([
                { $match: { state: "COMPLETED" } },
                { $group: {
                    _id: "$client",
                    total: { $sum: '$total' }
                }},
                {
                    $lookup: {
                        from: 'clients',
                        localField: '_id',
                        foreignField: '_id', 
                        as: 'client'
                    }
                },
                {
                    $limit: 3
                },
                {
                    $sort: { total: -1}
                }
            ]);

            return clients;
        },
        bestSellers: async() => {
            const sellers = await Order.aggregate([
                { $match: { state: 'COMPLETED'} },
                { $group: {
                    _id: '$seller',
                    total: { $sum: '$total' }
                }},
                {
                    $lookup: {
                       from: 'users',
                       localField: '_id',
                       foreignField: '_id',
                       as: 'seller'
                    }
                },
                {
                    $limit: 3
                },
                {
                    $sort: { total: -1, _id:1}
                }
            ]);
            return sellers;
        },
        searchProducts: async(_: null, {searchtext}:ProductInput) => {
            const products = await Product.find({ $text: { $search: searchtext }}).limit(10);

            return products
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

            client = await Client.findOneAndUpdate({_id: id}, input, {new: true});

            return client;
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
        },
        //Orders
        newOrder: async(_:null, {input}:OrderInput, ctx: UserCtx) => {

            const { client, order } = input

            let clientExists = await Client.findById(client);

            if(!clientExists) {
                throw new Error('The client you are looking for does not exists in our database');
            }

            if(clientExists.seller.toString() !== ctx.user.id) {
                throw new Error("You don't have permissions")
            }

            let article: ProductOrderI;

            for await (article of order) {
                const { id, quantity } = article;

                const product = await Product.findById(id);

                if(product) {
                    if(product && quantity > product.stock) {
                        throw new Error(`Article: ${product.name} exceeds the quantity available in stock`);
                    } else {
                        product.stock -= quantity;
                        await product.save();
                    }
                }
            }

            const newOrder = new Order(input);

            newOrder.seller = ctx.user.id;

            const result = await newOrder.save();

            return result;
        },
        updateOrder: async (_:null, {id, input}:OrderInput, ctx: UserCtx) => {

            const orderExists = await Order.findById(id);

            if(!orderExists) {
                throw new Error("Order doesn't exists");
            }

            const { client, order } = input;
            const clientExists = await Client.findById(client);

            if(!clientExists) {
                throw new Error("Client doesn't exists");
            }

            if(clientExists.seller.toString() !== ctx.user.id) {
                throw new Error("You don't have permissions");
            }

            if(order) {
                let article: ProductOrderI;
                for await (article of order) {
                    const { id, quantity } = article;
    
                    const product = await Product.findById(id);
    
                    if(product) {
                        if(product && quantity > product.stock) {
                            throw new Error(`Article: ${product.name} exceeds the quantity available in stock`);
                        } else {
                            product.stock -= quantity;
                            await product.save();
                        }
                    }
                }
            }

            const result = await Order.findOneAndUpdate({_id: id}, input, { new: true })
            return result
            
        },
        deleteOrder: async (_:null, {id}:OrderInput, ctx: UserCtx) => {
            const orderExists = await Order.findById(id);

            if(!orderExists) {
                throw new Error("Order doesn't exists");
            }

            if(orderExists.seller.toString() !== ctx.user.id ) {
                throw new Error("You don't have credentials");
            }

            await Order.findOneAndDelete({_id: id});

            return 'Order deleted!'
        }
    }
}

export default resolvers;