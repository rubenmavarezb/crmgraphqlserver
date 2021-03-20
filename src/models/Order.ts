import mongoose, { Schema, Document } from "mongoose";
//////////////////////////////////////////////////////

export interface OrderI extends Document {
    order: any[];
    total: number;
    client: string;
    seller: string;
    state: string;
    created: Date;
}

const OrderSchema = new Schema({
    order: {
        type: Array,
        required: true
    },
    total: {
        type: Number,
        required: true
    },
    client: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Client'
    },
    seller: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    state: {
        type: String,
        default: 'PENDING'
    },
    created: {
        type:Date,
        default: Date.now()
    }
})

export default mongoose.model<OrderI>('Order', OrderSchema);