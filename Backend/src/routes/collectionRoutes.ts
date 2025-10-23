import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.js";
import {
  createCollection,
  deleteCollection,
  getCollectionContent,
  getUserCollections,
  moveContentToCollection,
  updateCollection,
} from "../controllers/collectionController.js";

const router = Router();

// get all collections
router.get("/collections", authMiddleware, getUserCollections);

// create a collection
router.post("/collections", authMiddleware, createCollection);

// update collection
router.put("/collections/:collectionId", authMiddleware, updateCollection);

// delete collection
router.delete("/collections/:collectionId", authMiddleware, deleteCollection);

// get content in collection
router.get("/collections/:collectionId/contents", authMiddleware,getCollectionContent);

// moving content from one collection to other
router.put("/collections/:collectionId/move", authMiddleware, moveContentToCollection);

export default router;
