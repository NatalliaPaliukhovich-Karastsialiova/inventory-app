import { Router } from "express";
import {
  createInventory,
  getInventoryById,
  updateInventory,
  deleteInventory,
  listInventories,
  getInventoryByIdExternal,
  myListInventories
} from '../controllers/inventoryController.js';
import { auth } from "../middleware/authMiddleware.js";
import { getInventoryMessages } from "../controllers/inventoryMessageController.js";

const router = Router();

router.post('/', auth("user"), createInventory);
router.get('/', listInventories);
router.get('/my', auth("user"), myListInventories);
router.get('/internal/:id', auth("user"), getInventoryById);
router.get('/external/:id', getInventoryByIdExternal);
router.patch('/:id', auth("user"), updateInventory);
router.delete('/:id', auth("user"), deleteInventory);

router.get('/:id/messages', async (req, res) => {
  const { id } = req.params;
  const { limit, cursor } = req.query;

  try {
    const messages = await getInventoryMessages(
      id,
      parseInt(limit) || 50,
      cursor || null
    );
    res.json(messages);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to load messages' });
  }
});

export default router;
