import type { Request, Response } from "express";
import { Content, File } from "../models/index.js";
import { cloudinary } from "../config/cloudinary.js";

export const createContent = async (req: Request, res: Response) => {
    const { type, link, title, description, collection } = req.body;

    if(!type || !title) {
        return res.status(400).json({
            message: "Type and title are required!"
        });
    }

    try {
        const content = await Content.create({ 
            title,
            type,
            link,
            description,
            tags: [],
            collection: collection || undefined,
            userId: req.userId
        });
        
        res.status(201).json({
            message: "Content created successfully!",
            contentId: content._id
        });
    } catch (error) {
        console.error("Create content error:", error);
        res.status(500).json({
            message: "Unable to add content!"
        });
    }
};

export const getAllContent = async (req: Request, res: Response) => {
    const userId = req.userId;
    
    try {
        const contents = await Content.find({ userId })
            .populate("userId", "username")
            .sort({ createdAt: -1 });
            
        res.status(200).json({ contents });
    } catch (error) {
        console.error("Get content error:", error);
        res.status(500).json({
            message: "Couldn't get your contents"
        });
    }
};

export const deleteContent = async (req: Request, res: Response) => {
    const { contentId } = req.body;

    if(!contentId) {
        return res.status(400).json({
            message: "Content ID is required!"
        });
    }

    try {
        // First, find the content to check if it has associated files
        const content = await Content.findOne({ 
            _id: contentId,
            userId: req.userId 
        });

        if (!content) {
            return res.status(404).json({ 
                message: "Content not found" 
            });
        }

        // If content is a file type, find and delete the associated file from Cloudinary
        if (content.type === 'file') {
            const file = await File.findOne({ contentId: contentId });
            
            console.log('File found for deletion:', {
                fileExists: !!file,
                publicId: file?.publicId,
                resourceType: file?.resourceType
            });
            
            if (file && file.publicId) {
                try {
                    // Delete file from Cloudinary
                    const result = await cloudinary.uploader.destroy(file.publicId, { 
                        resource_type: file.resourceType || 'auto' 
                    });
                    console.log(`Cloudinary deletion result for ${file.publicId}:`, result);
                } catch (cloudinaryError) {
                    console.error('Error deleting from Cloudinary:', cloudinaryError);
                    // Continue with content deletion even if Cloudinary deletion fails
                }
                
                // Delete file record from database
                await File.deleteOne({ _id: file._id });
                console.log(`Deleted file record from database: ${file._id}`);
            } else {
                console.log('No file record or publicId found for this content');
            }
        }

        // Delete the content
        const result = await Content.deleteOne({ 
            _id: contentId,
            userId: req.userId 
        });

        if (result.deletedCount === 0) {
            return res.status(404).json({ 
                message: "Content not found or already deleted" 
            });
        }
        
        res.status(200).json({
            message: "Content deleted successfully!"
        });
    } catch (error) {
        console.error("Delete content error:", error);
        res.status(500).json({
            message: "Unable to delete content"
        });
    }
};

export const updateContent = async (req: Request, res: Response) => {
    const { contentId, title, description, link, collection } = req.body;

    if(!contentId) {
        return res.status(400).json({
            message: "Content ID is required!"
        });
    }

    try {
        const updateData: any = {};
        if (title !== undefined) updateData.title = title;
        if (description !== undefined) updateData.description = description;
        if (link !== undefined) updateData.link = link;
        if (collection !== undefined) updateData.collection = collection || null;

        const content = await Content.findOneAndUpdate(
            { _id: contentId, userId: req.userId },
            updateData,
            { new: true, runValidators: true }
        );

        if (!content) {
            return res.status(404).json({
                message: "Content not found!"
            });
        }

        res.status(200).json({
            message: "Content updated successfully!",
            content
        });
    } catch (error) {
        console.error("Update content error:", error);
        res.status(500).json({
            message: "Unable to update content"
        });
    }
};
