import mongoose, { Schema, Document } from "mongoose";

export interface UserI extends Document {
    name: string;
    lastname: string;
    email: string;
    password: string;
    created: Date;
}

const UserSchema = new Schema({
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
    email: {
        type: String,
        required: true,
        trim: true,
        unique: true
    },
    password: {
        type: String,
        required: true,
        trim: true,
    },
    created: {
        type: Date,
        default: Date.now()
    }
})

export default mongoose.model<UserI>('User', UserSchema);