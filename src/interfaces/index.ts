import { UserI } from '../models/User';
import { ProductI } from '../models/Product';

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