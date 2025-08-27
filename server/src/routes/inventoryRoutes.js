import { Router } from "express";
import {
  createInventory,
  getInventoryById,
  updateInventory,
  deleteInventory,
  listInventories,
  getInventoryByIdExternal,
  myListInventories,
  createItem,
  getItems,
  getInventoryStats
} from "../controllers/inventoryController.js";
import {
  auth,
  checkAccessListByInventory
} from "../middleware/authMiddleware.js";
import { loadMessages } from "../controllers/inventoryMessageController.js";
import { batchDeleteItems } from "../controllers/itemController.js";

const router = Router();

router.post("/", auth("user"), createInventory);
router.get("/", listInventories);
router.get("/me", auth("user"), myListInventories);
router.get(
  "/internal/:id",
  auth("user"),
  checkAccessListByInventory,
  getInventoryById
);
router.get("/external/:id", getInventoryByIdExternal);
router.patch("/:id", auth("user"), checkAccessListByInventory, updateInventory);
router.delete("/:id", auth("user"), deleteInventory);
router.post("/:inventoryId/items", auth("user"), createItem);
router.get("/:inventoryId/items", getItems);
router.get("/:id/stats", getInventoryStats);
router.delete("/:inventoryId/items", auth("user"), batchDeleteItems);
router.get("/:id/messages", loadMessages);

export default router;
