import mongoose from "mongoose";

const ContentSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    link: {
        type: String
    },
    type: {
        type: String,
        enum: ["link", "file"],
        required: true,
        default: "link"
    },
    description: {
        type: String
    },
    tags: [{
        type: mongoose.Types.ObjectId, 
        ref: 'Tag'
    }],
    collection: {
        type: mongoose.Types.ObjectId,
        ref: 'Collection'
    },
    userId: {
        type: mongoose.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, {
    timestamps: true
});

// indexing for faster search across title and description
ContentSchema.index({
    title: 'text',
    description: 'text'
})

export const Content = mongoose.model("Content", ContentSchema);
