import { Router } from "express";
import { shareContent, getSharedContent } from "../controllers/shareController.js";
import { authMiddleware } from "../middlewares/auth.js"

const router = Router();

// Get brain link (requires authentication)
router.get('/brain/share', authMiddleware, shareContent);

// Public route to view shared brain
router.get('/brain/:shareLink', getSharedContent);

export default router;
