import { Router } from "express";
import {
  getItemById,
  updateItem
} from '../controllers/itemController.js';
import { auth } from "../middleware/authMiddleware.js";

const router = Router();

router.get('/:id', getItemById);
router.patch('/:id', auth('user'), updateItem);

export default router;
