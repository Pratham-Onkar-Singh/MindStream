import type { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { User } from "../models/index.js";
import { JWT_SECRET } from "../config/environment.js";
import { generateRandomHash } from "../utils/hashGenerator.js";

export const signup = async (req: Request, res: Response) => {
    const { name, username, email, password } = req.body;
    
    if(!name || !username || !email || !password) {
        return res.status(400).json({
            message: "All fields are required!"
        });
    }
    
    try {
        const existingUsername = await User.findOne({ username });
        if(existingUsername) {
            return res.status(409).json({
                message: "Username already exists!"
            });
        }
        
        const existingEmail = await User.findOne({ email });
        if(existingEmail) {
            return res.status(409).json({
                message: "User with this email already exists!"
            });
        }

        // Generate unique brain link
        const brainLink = generateRandomHash(10);

        // Password will be automatically hashed by User model pre-save hook
        await User.create({
            name, 
            email, 
            username, 
            password, // Raw password - model will hash it
            brainLink,
            isBrainPublic: false
        });
        
        res.status(201).json({
            message: "User created successfully!"
        });
    } catch (error) {
        console.error("Signup error:", error);
        res.status(500).json({
            message: "Unable to create user!"
        });
    }
};

export const signin = async (req: Request, res: Response) => {
    const { email, password } = req.body;
    
    if(!email || !password) {
        return res.status(400).json({
            message: "Email and password are required!"
        });
    }
    
    try {
        const user = await User.findOne({ email });

        if(!user) {
            return res.status(401).json({
                message: "Invalid email or password!"
            });
        }

        // Use the model's comparePassword method
        const passwordMatched = await user.comparePassword(password);

        if(passwordMatched) {
            // Generate brain link if user doesn't have one (for existing users)
            if (!user.brainLink) {
                user.brainLink = generateRandomHash(10);
                await user.save();
            }

            const token = jwt.sign(
                { userId: user._id },
                JWT_SECRET,
                { expiresIn: '7d' }
            );
            
            res.json({
                token,
                user: {
                    id: user._id,
                    name: user.name,
                    username: user.username,
                    email: user.email
                }
            });
        } else {
            res.status(401).json({
                message: "Invalid email or password!"
            });
        }
    } catch(error) {
        console.error("Signin error:", error);
        res.status(500).json({
            message: "Server error occurred!"
        });
    }
};
