import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import User from "../models/User";

// Extend Express Request type to include user
declare global {
    namespace Express {
        interface Request {
            userId?: string;
        }
    }
}

export const authenticate = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        // Get token from Authorization header
        const authHeader = req.headers.authorization;
        
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({ error: "No token provided" });
        }

        const token = authHeader.substring(7); // Remove "Bearer " prefix

        if (!process.env.JWT_SECRET) {
            return res.status(500).json({ error: "JWT_SECRET not configured" });
        }

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET) as { userId: string; username: string };
        
        // Check if user still exists
        const user = await User.findById(decoded.userId);
        if (!user) {
            return res.status(401).json({ error: "User not found" });
        }

        // Attach userId to request object
        req.userId = decoded.userId;
        next();
    } catch (error) {
        if (error instanceof jwt.JsonWebTokenError) {
            return res.status(401).json({ error: "Invalid token" });
        }
        next(error);
    }
};
