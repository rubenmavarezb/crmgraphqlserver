import mongoose, { Schema, Document } from "mongoose";
//////////////////////////////////////////////////////

export interface ClientI extends Document {
    name: string;
    lastname: string;
    company: string;
    email: string;
    phone: string;
    created: Date;
    seller: string;
}

const ClientSchema = new Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    lastname : {
        type: String,
        required: true,
        trim: true
    },
    company: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        trim: true,
        unique: true
    },
    phone: {
        type: String,
        trim: true,
    },
    created: {
        type: Date,
        default: Date.now()
    },
    seller: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    }
})

export default mongoose.model<ClientI>('Client', ClientSchema);