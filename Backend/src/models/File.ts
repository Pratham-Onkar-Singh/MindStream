import mongoose from "mongoose";

const fileSchema = new mongoose.Schema({
    filename: {
        type: String,
    },
    url: {
        type: String,
    },
    publicId: {
        type: String,
    },
    resourceType: {
        type: String,
    },
    format: {
        type: String,
    },
    bytes: {
        type: String,
    },
    height: {
        type: Number,
    },
    width: {
        type: Number,
    },
    contendId: {
        type: mongoose.Types.ObjectId, 
        ref: 'Content'
    }
}, {
    timestamps: true
});

export const File = mongoose.model("File", fileSchema);

