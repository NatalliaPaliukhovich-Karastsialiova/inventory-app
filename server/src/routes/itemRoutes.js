import { Router } from "express";
import { getItemById, updateItem } from "../controllers/itemController.js";
import { auth, checkAccessByItem } from "../middleware/authMiddleware.js";

const router = Router();

router.get("/:id", checkAccessByItem, getItemById);
router.patch("/:id", auth("user"), updateItem);

export default router;
