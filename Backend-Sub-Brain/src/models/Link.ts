import mongoose from "mongoose";

const LinkSchema = new mongoose.Schema({
    hash: {
        type: String,
        unique: true,
        required: true
    },
    userId: {
        type: mongoose.Types.ObjectId,
        unique: true,
        ref: "User",
        required: true
    },
    share: {
        type: Boolean
    }
}, {
    timestamps: true
});

export const Link = mongoose.model("Link", LinkSchema);
