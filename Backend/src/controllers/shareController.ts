import type { Request, Response } from "express";
import { Link, Content, User } from "../models/index.js";
import { generateRandomHash } from "../utils/hashGenerator.js";

export const shareContent = async (req: Request, res: Response) => {
    const userId = req.userId;
    
    try {
        // Get user's permanent brain link
        const user = await User.findById(userId);
        
        if(!user || !user.brainLink) {
            return res.status(404).json({
                message: "User not found or brain link not generated"
            });
        }
        
        return res.status(200).json({
            message: "Brain link retrieved successfully",
            hash: user.brainLink,
            isBrainPublic: user.isBrainPublic
        });
    } catch (error) {
        console.error("Share content error:", error);
        res.status(500).json({
            message: "Unable to retrieve brain link"
        });
    }
};

export const getSharedContent = async (req: Request, res: Response) => {
    const hash = req.params.shareLink;
    
    try {
        // Find user by their brain link
        const user = await User.findOne({ brainLink: hash });
        
        if(!user) {
            return res.status(404).json({
                message: "Brain link not found"
            });
        }

        // Check if brain is public
        if(!user.isBrainPublic) {
            return res.status(403).json({
                message: "This brain is private",
                username: user.username,
                isPrivate: true
            });
        }

        // Get user's content
        const content = await Content.find({ userId: user._id })
            .sort({ createdAt: -1 });
        
        res.status(200).json({
            username: user.username,
            content,
            isPrivate: false
        });
    } catch (error) {
        console.error("Get shared content error:", error);
        res.status(500).json({
            message: "Unable to retrieve shared content"
        });
    }
};
