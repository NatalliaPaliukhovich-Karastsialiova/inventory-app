import { Router } from "express";
import {
  createInventory,
  getInventoryById,
  updateInventory,
  deleteInventory,
  listInventories,
} from '../controllers/inventoryController.js';
import { auth } from "../middleware/authMiddleware.js";

const router = Router();

router.post('/', auth("user"), createInventory);
router.get('/', listInventories);
router.get('/:id', getInventoryById);
router.put('/:id', auth("user"), updateInventory);
router.delete('/:id', auth("user"), deleteInventory);

export default router;
