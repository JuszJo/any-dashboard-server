import mongoose, { Schema } from "mongoose";
import { v4 as uuidv4 } from "uuid";

const UserSchema = new Schema({
    username: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    fullName: {
        type: String
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    role: {
        type: String,
    },
    uuid: {
        type: String,
        default: uuidv4(),
    }
}, {
    collection: "user",
})

const UserModel = mongoose.model("users", UserSchema);

export default UserModel;