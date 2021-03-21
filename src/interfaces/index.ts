import { UserI } from '../models/User';
import { ProductI } from '../models/Product';
import { ClientI } from '../models/Client';
import { OrderI } from '../models/Order';
//////////////////////////////////////////////

export interface UserInput {
    input: UserI
}

export interface ProductInput {
    input: ProductI;
    id: string;
    searchtext: string;
}

export interface ClientInput {
    input: ClientI;
    id: string;
}

export interface OrderInput {
    input: OrderI;
    id: string;
    state: string;
}

export interface Token {
    token: string;
}

export interface UserCtx {
    user: UserI;
}

export interface ProductOrderI extends ProductI {
    quantity: number;
}