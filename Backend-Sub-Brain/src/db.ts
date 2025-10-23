import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

const MONGO_URL: string = process.env.MONGO_URL ?? "";
if (!MONGO_URL) {
    throw new Error("MONGO_URL environment variable is not set.");
}
const connect_mongodb = async () => {
    try {
        await mongoose.connect(MONGO_URL);
        console.log("Connected to DB!");
    } catch (error) {
        console.error();
    }
}

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    username: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true,
    }
})

const ContentSchema = new mongoose.Schema({
    title: {
        type: String
    },
    link: {
        type: String
    },
    type: {
        type: String,
        enum: ["tweet", "youtube"]
    },
    description: {
        type: String
    },
    tags: [{type: mongoose.Types.ObjectId, ref:'Tag'}],
    userId: {
        type: mongoose.Types.ObjectId,
        ref: 'User'
    }
})

const TagSchema = new mongoose.Schema({
    title: {
        type: String
    }
})

const LinkSchema = new mongoose.Schema({
    hash: {
        type: String,
        unique: true
    },
    userId: {
        type: mongoose.Types.ObjectId,
        unique: true,
        ref: "User"
    }
})

const User = mongoose.model("User", UserSchema);
const Link = mongoose.model("Link", LinkSchema);
const Tag = mongoose.model("Tag", TagSchema);
const Content = mongoose.model("Content", ContentSchema);

export { User, Link, Tag, Content, connect_mongodb }
