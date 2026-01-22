import express from "express";
import { shorten, deleteUrl, redirect } from "./urls.controllers";
import { authorize } from "../../middleware/auth.middleware";

const router = express.Router();

// Public route - anyone can access shortened URLs
router.get("/:shortCode", redirect);

// Protected routes - require authentication
router.post("/shorten", authorize, shorten);
router.delete("/:code", authorize, deleteUrl);

export default router;