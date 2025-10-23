import type { Request, Response } from "express";
import { User } from "../models/User.js";
import { Content } from "../models/Content.js";

// Get user profile
export const getUserProfile = async (req: Request, res: Response) => {
    try {
        const userId = req.userId; // Set by auth middleware

        // Get user details
        const user = await User.findById(userId).select('-password');
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        // Get content statistics
        const totalContent = await Content.countDocuments({ userId });
        const fileCount = await Content.countDocuments({ userId, type: 'file' });
        const linkCount = await Content.countDocuments({ userId, type: 'link' });

        return res.status(200).json({
            success: true,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                username: user.username,
                brainLink: user.brainLink,
                isBrainPublic: user.isBrainPublic,
                createdAt: user.createdAt
            },
            stats: {
                totalContent,
                fileCount,
                linkCount
            }
        });
    } catch (error) {
        console.error('Get profile error:', error);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch user profile"
        });
    }
};

// Update user profile
export const updateUserProfile = async (req: Request, res: Response) => {
    try {
        const userId = req.userId;
        const { name, username, email } = req.body;

        // Validate input
        if (!name && !username && !email) {
            return res.status(400).json({
                success: false,
                message: "At least one field is required to update"
            });
        }

        // Check if username or email already exists (if being updated)
        if (username) {
            const existingUser = await User.findOne({ username, _id: { $ne: userId } });
            if (existingUser) {
                return res.status(400).json({
                    success: false,
                    message: "Username already taken"
                });
            }
        }

        if (email) {
            const existingUser = await User.findOne({ email, _id: { $ne: userId } });
            if (existingUser) {
                return res.status(400).json({
                    success: false,
                    message: "Email already in use"
                });
            }
        }

        // Update user
        const updateData: any = {};
        if (name) updateData.name = name;
        if (username) updateData.username = username;
        if (email) updateData.email = email;

        const user = await User.findByIdAndUpdate(
            userId,
            updateData,
            { new: true }
        ).select('-password');

        return res.status(200).json({
            success: true,
            message: "Profile updated successfully",
            user: {
                id: user?._id,
                name: user?.name,
                email: user?.email,
                username: user?.username
            }
        });
    } catch (error) {
        console.error('Update profile error:', error);
        return res.status(500).json({
            success: false,
            message: "Failed to update profile"
        });
    }
};

// Toggle brain visibility
export const toggleBrainVisibility = async (req: Request, res: Response) => {
    try {
        const userId = req.userId;
        const { isBrainPublic } = req.body;

        if (typeof isBrainPublic !== 'boolean') {
            return res.status(400).json({
                success: false,
                message: "isBrainPublic must be a boolean value"
            });
        }

        const user = await User.findByIdAndUpdate(
            userId,
            { isBrainPublic },
            { new: true }
        ).select('-password');

        return res.status(200).json({
            success: true,
            message: `Brain is now ${isBrainPublic ? 'public' : 'private'}`,
            isBrainPublic: user?.isBrainPublic,
            brainLink: user?.brainLink
        });
    } catch (error) {
        console.error('Toggle visibility error:', error);
        return res.status(500).json({
            success: false,
            message: "Failed to update brain visibility"
        });
    }
};
