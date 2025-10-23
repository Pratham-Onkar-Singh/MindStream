import { Router } from "express";
import { createContent, getAllContent, deleteContent } from "../controllers/contentController.js";
import { authMiddleware } from "../middlewares/auth.js";

const router = Router();

// All content routes require authentication
router.post('/content', authMiddleware, createContent);
router.get('/content', authMiddleware, getAllContent);
router.delete('/content', authMiddleware, deleteContent);

export default router;
