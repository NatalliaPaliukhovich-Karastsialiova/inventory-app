import {
  getItemByIdFromDb,
  updateItemInDb,
  addLikeToItem,
  removeLikeFromItem,
  getItemLikesCount,
  hasUserLikedItem,
  deleteItemFromDb,
  batchDeleteItemsFromDb
} from "../models/itemModel.js";
import prisma from "../config/db.js";
import { sendError, mapAndSendError } from "../utils/http.js";
import { canAccessItem } from "../models/userModel.js";

export async function getItemById(req, res) {
  try {
    const { id } = req.params;
    const item = await getItemByIdFromDb(id);

    if (!item) {
      return sendError(res, "ITEM_NOT_FOUND", 404);
    }
    const likes = await getItemLikesCount(id);
    const likedByMe = await hasUserLikedItem(id, req.user?.id);
    res.json({
      ...item,
      writeAccess: req.writeAccess,
      ownerOrAdmin: req.ownerOrAdmin,
      likes,
      likedByMe
    });
  } catch (error) {
    console.error(error);
    return mapAndSendError(res, error);
  }
}

export async function updateItem(req, res) {
  try {
    const { id } = req.params;
    const { fieldValues, customId, version } = req.body;
    if (req.user?.role !== "admin") {
      const allowed = await canAccessItem(id, req.user?.id, req.user?.role);
      if (!allowed) return sendError(res, "INVENTORY_NO_WRITE_ACCESS", 403);
    }
    const item = await updateItemInDb(id, fieldValues, customId, version);
    const likes = await getItemLikesCount(id);
    const likedByMe = await hasUserLikedItem(id, req.user?.id);
    res.json({
      ...item,
      writeAccess: req.writeAccess,
      ownerOrAdmin: req.ownerOrAdmin,
      likes,
      likedByMe
    });
  } catch (error) {
    if (error?.code === "VERSION_CONFLICT")
      return sendError(res, "VERSION_CONFLICT", 409);
    if (error?.code === "ITEM_INVALID_CUSTOM_ID")
      return sendError(res, "ITEM_INVALID_CUSTOM_ID", 400);
    console.error(error);
    return mapAndSendError(res, error);
  }
}

export async function likeItem(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    await addLikeToItem(id, userId);
    const likes = await getItemLikesCount(id);
    res.json({ likes, likedByMe: true });
  } catch (error) {
    if (error?.code === "P2002") {
      const likes = await getItemLikesCount(req.params.id);
      return res.json({ likes, likedByMe: true });
    }
    console.error(error);
    return mapAndSendError(res, error);
  }
}

export async function unlikeItem(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    await removeLikeFromItem(id, userId);
    const likes = await getItemLikesCount(id);
    res.json({ likes, likedByMe: false });
  } catch (error) {
    console.error(error);
    return mapAndSendError(res, error);
  }
}

export async function deleteItem(req, res) {
  try {
    const { id } = req.params;
    if (req.user?.role !== "admin") {
      const allowed = await canAccessItem(id, req.user?.id, req.user?.role);
      if (!allowed) return sendError(res, "INVENTORY_NO_WRITE_ACCESS", 403);
    }
    await deleteItemFromDb(id);
    res.json({ message: "ITEM_DELETED_SUCCESS" });
  } catch (error) {
    console.error(error);
    return mapAndSendError(res, error);
  }
}

export async function batchDeleteItems(req, res) {
  try {
    const { ids } = req.body;
    if (!Array.isArray(ids) || !ids.length) return sendError(res, "ADMIN_IDS_ARRAY_REQUIRED", 400);
    if (req.user?.role !== "admin") {
      const allowedItems = await prisma.item.findMany({
        where: {
          id: { in: ids },
          inventory: {
            OR: [
              { ownerId: req.user.id },
              { accessList: { some: { userId: req.user.id } } },
              { isPublic: true }
            ]
          }
        },
        select: { id: true }
      });
      const allowedIds = new Set(allowedItems.map((x) => x.id));
      if (allowedIds.size !== ids.length) return sendError(res, "INVENTORY_NO_WRITE_ACCESS", 403);
    }
    await batchDeleteItemsFromDb(ids);
    res.json({ message: "ITEMS_DELETED_SUCCESS" });
  } catch (error) {
    console.error(error);
    return mapAndSendError(res, error);
  }
}
