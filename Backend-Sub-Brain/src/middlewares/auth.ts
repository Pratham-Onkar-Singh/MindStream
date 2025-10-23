import type { Request, Response, NextFunction } from "express";
import jwt, { type JwtPayload } from "jsonwebtoken"
import { User } from "../models/index.js";
import { JWT_SECRET } from "../config/environment.js";

declare global {
    namespace Express {
        export interface Request {
            userId: string;
        }
    }
}

export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const token = req.headers.token;
        
        if(typeof token !== "string") {
            return res.status(401).json({
                message: "Invalid token!"
            })
        }
        const decoded = jwt.verify(token , JWT_SECRET);
        
        if(decoded) {
            const { userId } = decoded as JwtPayload;
            const user = await User.findById(userId);
            if(!user) {
                res.status(400).json({
                    message: "User no longer exists!"
                })
                return;
            }
            req.userId = (decoded as JwtPayload).userId;
            next();
        } else {
            res.status(400).json({
                message: "You are not logged In!"
            })
        }
    } catch (error) {
        res.status(401).json({
            message: "Invalid or expired token!"
        })
    }
}
