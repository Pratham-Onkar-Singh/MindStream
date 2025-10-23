import { Router } from "express";
import authRoutes from "./authRoutes.js";
import contentRoutes from "./contentRoutes.js";
import shareRoutes from "./shareRoutes.js";
import uploadRoutes from "./uploadRoutes.js"
import searchRoutes from "./searchRoutes.js"
import userRoutes from "./userRoutes.js"


const router = Router();

// Mount all route modules
router.use('/v1', authRoutes);
router.use('/v1', contentRoutes);
router.use('/v1', shareRoutes);
router.use('/v1', uploadRoutes);
router.use('/v1', searchRoutes)
router.use('/v1/user', userRoutes)

export default router;
