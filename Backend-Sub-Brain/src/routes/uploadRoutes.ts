import { Router } from "express";
import multer from "multer";
import { createSingleFile } from "../controllers/uploadController.js";
import { authMiddleware } from "../middlewares/auth.js";

const router = Router();

// multer middleware to store files in RAM(buffer), so u can acces this file using req.file.buffer
// without committing to memory
const upload = multer({ storage: multer.memoryStorage() });

router.post('/upload', authMiddleware, upload.single('file'), createSingleFile)

export default router

