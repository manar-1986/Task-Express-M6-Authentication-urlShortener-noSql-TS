import { NextFunction, Request, Response } from "express";
import User from "../../models/User";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const SALT = 10;

export const signup = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { username, password } = req.body;

        // Validate input
        if (!username || !password) {
            return res.status(400).json({ error: "Username and password are required" });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ username: username });
        if (existingUser) {
            return res.status(400).json({ error: "Username already exists" });
        }

        // Hash the password using bcrypt
        const hashedPassword = await bcrypt.hash(password, SALT);
        
        // Create user with the hashed password
        const newUser = await User.create({ username: username, password: hashedPassword });

        // Generate JWT token
        const token = jwt.sign(
            { _id: newUser._id, username: newUser.username },
            process.env.JWT_SECRET!,
            { expiresIn: '7d' }
        );

        // Return the generated token
        res.status(201).json({ token });
    } catch (err) {
        next(err);
    }
};

export const signin = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { username, password } = req.body;

        // Validate input
        if (!username || !password) {
            return res.status(400).json({ error: "Username and password are required" });
        }

        // Check if the user exists
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(401).json({ error: "Invalid credentials" });
        }

        // Compare the submitted password against the stored hash password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ error: "Invalid credentials" });
        }

        // Generate JWT token
        const token = jwt.sign(
            { 
                userId: user._id,
                username: user.username 
            },
            process.env.JWT_SECRET!,
            { expiresIn: "7d" }
        );

        // Return the token and user information
        res.status(200).json({
            token,
            user: {
                id: user._id,
                username: user.username,
            },
        });
    } catch (err) {
        next(err);
    }
};

export const getUsers = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const users = await User.find().populate("urls").select("-password");
        res.status(200).json(users);
    } catch (err) {
        next(err);
    }
};