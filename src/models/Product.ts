import mongoose, { Schema, Document } from "mongoose";
//////////////////////////////////////////////////////

export interface ProductI extends Document {
    name: string;
    stock: number;
    price: number;
    created: Date;
}

const ProductSchema = new Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    stock: {
        type: Number,
        required: true,
        trim: true
    },
    price: {
        type: Number,
        required: true,
        trim: true
    },
    created: {
        type: Date,
        default: Date.now()
    }
})

export default mongoose.model<ProductI>('Product', ProductSchema);