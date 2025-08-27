import { Router } from "express";
import { getItemById, updateItem, likeItem, unlikeItem, deleteItem } from "../controllers/itemController.js";
import { auth, checkAccessByItem } from "../middleware/authMiddleware.js";

const router = Router();

router.get("/:id", checkAccessByItem, getItemById);
router.patch("/:id", auth("user"), checkAccessByItem, updateItem);
router.post("/:id/like", auth("user"), likeItem);
router.delete("/:id/like", auth("user"), unlikeItem);
router.delete("/:id", auth("user"), deleteItem);

export default router;
