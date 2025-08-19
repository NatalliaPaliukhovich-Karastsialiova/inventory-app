import { getItemByIdFromDb, updateItemInDb } from "../models/itemModel.js";

export async function getItemById(req, res) {
  try {
    const { id } = req.params;
    const item = await getItemByIdFromDb(id);

    if (!item) {
      return res.status(404).json({ error: "ITEM_NOT_FOUND" });
    }
    res.json({
      ...item,
      writeAccess: req.writeAccess,
      ownerOrAdmin: req.ownerOrAdmin
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "ITEM_FAILED_FETCH" });
  }
}

export async function updateItem(req, res) {
  try {
    const { id } = req.params;
    const { fieldValues } = req.body;
    const item = await updateItemInDb(id, fieldValues);
    res.json(item);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "ITEM_FAILED_UPDATE" });
  }
}
