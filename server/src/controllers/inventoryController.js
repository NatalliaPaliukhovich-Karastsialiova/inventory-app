import prisma from "../config/db.js";
import {
  createInventoryInDb,
  getInventoryByIdFromDb,
  getInventoryByIdExternalFromDb,
  updateInventoryInDb,
  deleteInventoryFromDb,
  listInventoriesFromDb,
  myListInventoriesFromDb,
  createItemInDb,
  getItemsFromDb,
  updateItemInDb
} from "../models/inventoryModel.js";

export async function createInventory(req, res) {
  try {
    const inventory = await createInventoryInDb(req.body, req.user.id);
    res.status(201).json(inventory);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "INVENTORY_FAILED_CREATE" });
  }
}

export async function getInventoryById(req, res) {
  try {
    const { id } = req.params;
    const inventory = await getInventoryByIdFromDb(id);

    if (!inventory) {
      return res.status(404).json({ error: "INVENTORY_NOT_FOUND" });
    }

    res.json({
      ...inventory,
      writeAccess: req.writeAccess,
      ownerOrAdmin: req.ownerOrAdmin
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "INVENTORY_FAILED_FETCH" });
  }
}

export async function getInventoryByIdExternal(req, res) {
  try {
    const { id } = req.params;
    const inventory = await getInventoryByIdExternalFromDb(id);

    if (!inventory) {
      return res.status(404).json({ error: "INVENTORY_NOT_FOUND" });
    }

    res.json(inventory);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "INVENTORY_FAILED_FETCH" });
  }
}

export async function updateInventory(req, res) {
  try {
    const { id } = req.params;
    const updatedInventory = await updateInventoryInDb(id, req.body);
    res.json({
      ...updatedInventory,
      writeAccess: req.writeAccess,
      ownerOrAdmin: req.ownerOrAdmin
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "INVENTORY_FAILED_UPDATE" });
  }
}

export async function deleteInventory(req, res) {
  try {
    const { id } = req.params;
    await deleteInventoryFromDb(id);
    res.json({ message: "INVENTORY_DELETED_SUCCESS" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "INVENTORY_FAILED_DELETE" });
  }
}

export async function listInventories(req, res) {
  try {
    const inventories = await listInventoriesFromDb();
    res.json(inventories);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "COMMON_SERVER_ERROR" });
  }
}

export async function myListInventories(req, res) {
  try {
    const { type = "own" } = req.query;
    const inventories = await myListInventoriesFromDb(req.user.id, type);
    res.json(inventories);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "COMMON_SERVER_ERROR" });
  }
}

export async function createItem(req, res) {
  const { inventoryId } = req.params;
  const { fieldValues } = req.body;

  const inventory = await getInventoryByIdFromDb(inventoryId);

  if (!inventory) {
    return res.status(404).json({ error: "INVENTORY_NOT_FOUND" });
  }

  const canWrite =
    inventory.ownerId === req.user.id ||
    inventory.accessList.some((a) => a.userId === req.user.id);
  if (!canWrite) {
    return res.status(403).json({ error: "INVENTORY_NO_WRITE_ACCESS" });
  }

  const fieldIds = fieldValues.map((f) => f.fieldId);
  const inventoryFields = await prisma.inventoryField.findMany({
    where: { inventoryId, id: { in: fieldIds } }
  });
  if (inventoryFields.length !== fieldValues.length) {
    return res.status(400).json({ error: "INVENTORY_INVALID_FIELDS" });
  }

  const item = await createItemInDb(inventoryId, fieldValues);

  res.status(201).json(item);
}

export const getItems = async (req, res) => {
  try {
    const { inventoryId } = req.params;

    if (!inventoryId) {
      return res.status(400).json({ message: "ITEM_INVENTORY_ID_REQUIRED" });
    }
    const items = await getItemsFromDb(inventoryId);

    return res.status(200).json(items);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "COMMON_SERVER_ERROR", error });
  }
};
