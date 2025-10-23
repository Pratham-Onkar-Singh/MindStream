import { Router } from "express";
import { getUserProfile, updateUserProfile, toggleBrainVisibility } from "../controllers/userController.js";
import { authMiddleware } from "../middlewares/auth.js";

const router = Router();

// Get user profile
router.get('/profile', authMiddleware, getUserProfile);

// Update user profile
router.put('/profile', authMiddleware, updateUserProfile);

// Toggle brain visibility
router.put('/brain-visibility', authMiddleware, toggleBrainVisibility);

export default router;
