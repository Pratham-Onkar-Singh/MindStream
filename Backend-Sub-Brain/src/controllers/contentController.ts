import type { Request, Response } from "express";
import { Content } from "../models/index.js";

export const createContent = async (req: Request, res: Response) => {
    const { type, link, title, description } = req.body;

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
