import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.js";
import { searchContent } from "../controllers/searchController.js";

const router = Router();

router.get('/search', authMiddleware, searchContent)

export default router;
