import mongoose from "mongoose";

const CollectionSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    description: {
        type: String
    },
    icon: {
        type: String,
        default: '📁',
    },
    color: {
        type: String,
        default: '#6B7280'
    },
    userId: {
        type: mongoose.Types.ObjectId,
        ref: 'User',
        required: true
    },
    parentCollection: {
        type: mongoose.Types.ObjectId,
        ref: 'Collection'
    },
    isDefault: {
        type: Boolean,
        default: false
    }
}, { timestamps: true })

// indexing for faster queries based on userId and name:
CollectionSchema.index({ userId: 1, name: 1 });

export const Collection = mongoose.model('Collection', CollectionSchema);




