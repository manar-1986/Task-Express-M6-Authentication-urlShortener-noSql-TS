import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

// Extend Express Request type to include user
declare global {
    namespace Express {
        interface Request {
            user?: {
                id: string;
                userId: string;
                username: string;
            };
        }
    }
}

export const authorize = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        // Extract token from Authorization header
        // Format: "Bearer <token>"
        const authHeader = req.headers.authorization;
        
        if (!authHeader) {
            return res.status(401).json({ error: "No token provided" });
        }
        
        const [scheme, token] = authHeader.split(' ') || [];
        if (scheme !== 'Bearer' || !token) {
            return res.status(401).json({ message: 'Invalid auth format' });
        }
    
        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string; username: string };
        
        // Attach user to request
        req.user = {
            id: decoded.userId,
            userId: decoded.userId,
            username: decoded.username,
        };
    
        next(); // Continue to the route handler
    } catch (error) {
        if (error instanceof jwt.JsonWebTokenError) {
            return res.status(401).json({ error: "Invalid token" });
        }
        if (error instanceof jwt.TokenExpiredError) {
            return res.status(401).json({ error: "Token expired" });
        }
        return res.status(500).json({ error: "Authentication failed" });
    }
};
