import { UserI } from '../models/User';
import { ProductI } from '../models/Product';
import { ClientI } from '../models/Client';
//////////////////////////////////////////////

export interface UserInput {
    input: UserI
}

export interface Token {
    token: string;
}

export interface ProductInput {
    input: ProductI;
    id: string;
}

export interface ClientInput {
    input: ClientI;
    id: string;
}

export interface UserCtx {
    user: UserI
}