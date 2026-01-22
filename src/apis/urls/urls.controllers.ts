import Url from "../../models/Url";
import shortid from "shortid";
import User from "../../models/User";
import { NextFunction, Request, Response } from "express";
import mongoose from "mongoose";

const baseUrl = "http://localhost:8000/urls";

export const shorten = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const userId = req.user.id; // Get from authenticated user
    // create url code
    const urlCode = shortid.generate();
    try {
        req.body.shortUrl = `${baseUrl}/${urlCode}`;
        req.body.urlCode = urlCode;
        req.body.userId = userId;
        const newUrl = await Url.create(req.body);
        await User.findByIdAndUpdate(userId, {
            $push: { urls: newUrl._id },
        });
        res.json(newUrl);
    } catch (err) {
        next(err);
    }
};

export const redirect = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const url = await Url.findOne({ urlCode: req.params.shortCode });
        if (url) {
            res.redirect(url.longUrl || "");
        } else {
            res.status(404).json({ error: "No URL Found" });
        }
    } catch (err) {
        next(err);
    }
};

export const deleteUrl = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const userId = new mongoose.Types.ObjectId(req.user.id);
        const url = await Url.findOne({ urlCode: req.params.code });
        if (userId.equals(url?.userId)) {
            await Url.findByIdAndDelete(url._id);
            res.status(201).json("Deleted");
        } else {
            res.status(403).json("Forbidden");
        }
    } catch (err) {
        next(err);
    }
};

export const getUserUrls = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // Get userId from authenticated user
        if (!req.user) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        // Get all URLs for the authenticated user
        const urls = await Url.find({ userId: req.user.userId });
        res.status(200).json(urls);
    } catch (err) {
        next(err);
    }
};