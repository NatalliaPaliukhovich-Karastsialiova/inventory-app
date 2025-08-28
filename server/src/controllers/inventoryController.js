import prisma from "../config/db.js";
import { sendError, mapAndSendError } from "../utils/http.js";
import { InventoryCategory, FieldType, IdSeqType } from "@prisma/client";
import { z } from "zod";
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
  updateItemInDb,
  computeInventoryStats
} from "../models/inventoryModel.js";

const TagInputSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1).optional()
}).refine((v) => Boolean(v.id || v.name), { message: "TAG_ID_OR_NAME_REQUIRED" });

const AccessInputSchema = z.object({
  userId: z.string().uuid()
});

const CustomIdElementSchema = z.object({
  type: z.nativeEnum(IdSeqType),
  value: z.string().optional(),
  separator: z.string().nullable().optional()
});

const InventoryFieldSchema = z.object({
  id: z.string().uuid().optional(),
  label: z.string().min(1),
  description: z.string().optional().nullable(),
  type: z.nativeEnum(FieldType),
  showInTable: z.boolean().optional(),
});

const createInventorySchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  category: z.nativeEnum(InventoryCategory),
  imageUrl: z.string().url().optional().or(z.literal("")).optional().nullable(),
  isPublic: z.boolean().optional(),
  tags: z.array(TagInputSchema).optional(),
  accessList: z.array(AccessInputSchema).optional(),
  customIdElements: z.array(CustomIdElementSchema).optional(),
  inventoryField: z.array(InventoryFieldSchema).optional()
});

const updateInventorySchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  category: z.nativeEnum(InventoryCategory).optional(),
  imageUrl: z.string().url().optional().or(z.literal("")).optional().nullable(),
  isPublic: z.boolean().optional(),
  version: z.number().int().nonnegative().optional(),
  tags: z.array(TagInputSchema).optional(),
  accessList: z.array(AccessInputSchema).optional(),
  customIdElements: z.array(CustomIdElementSchema).optional(),
  inventoryField: z.array(InventoryFieldSchema).optional()
});

export async function createInventory(req, res) {
  try {
    const parsed = createInventorySchema.safeParse(req.body || {});
    if (!parsed.success) return sendError(res, "INVENTORY_INVALID_FIELDS", 400);
    const inventory = await createInventoryInDb(parsed.data, req.user.id);
    res.status(201).json(inventory);
  } catch (error) {
    console.error(error);
    return mapAndSendError(res, error);
  }
}

export async function getInventoryById(req, res) {
  try {
    const { id } = req.params;
    const inventory = await getInventoryByIdFromDb(id);

    if (!inventory) return sendError(res, "INVENTORY_NOT_FOUND", 404);

    res.json({
      ...inventory,
      writeAccess: req.writeAccess,
      ownerOrAdmin: req.ownerOrAdmin
    });
  } catch (error) {
    console.error(error);
    return mapAndSendError(res, error);
  }
}

export async function getInventoryByIdExternal(req, res) {
  try {
    const { id } = req.params;
    const inventory = await getInventoryByIdExternalFromDb(id);

    if (!inventory) return sendError(res, "INVENTORY_NOT_FOUND", 404);

    res.json(inventory);
  } catch (error) {
    console.error(error);
    return mapAndSendError(res, error);
  }
}

export async function updateInventory(req, res) {
  try {
    const { id } = req.params;
    const parsed = updateInventorySchema.safeParse(req.body || {});
    if (!parsed.success) return sendError(res, "INVENTORY_INVALID_FIELDS", 400);
    const { version, ...rest } = parsed.data;
    const updatedInventory = await updateInventoryInDb(id, rest, version);
    res.json({
      ...updatedInventory,
      writeAccess: req.writeAccess,
      ownerOrAdmin: req.ownerOrAdmin
    });
  } catch (error) {
    console.error(error);
    return mapAndSendError(res, error);
  }
}

export async function deleteInventory(req, res) {
  try {
    const { id } = req.params;
    const inv = await prisma.inventory.findUnique({ where: { id }, select: { ownerId: true } });
    if (!inv) return sendError(res, "INVENTORY_NOT_FOUND", 404);
    if (req.user?.role !== 'admin' && inv.ownerId !== req.user?.id) return sendError(res, "INVENTORY_NO_WRITE_ACCESS", 403);
    await deleteInventoryFromDb(id);
    res.json({ message: "INVENTORY_DELETED_SUCCESS" });
  } catch (error) {
    console.error(error);
    return mapAndSendError(res, error);
  }
}

export async function listInventories(req, res) {
  try {
    const inventories = await listInventoriesFromDb();
    res.json(inventories);
  } catch (error) {
    console.error(error);
    return mapAndSendError(res, error);
  }
}

export async function myListInventories(req, res) {
  try {
    const { type = "own" } = req.query;
    const inventories = await myListInventoriesFromDb(req.user.id, type);
    res.json(inventories);
  } catch (error) {
    console.error(error);
    return mapAndSendError(res, error);
  }
}

export async function createItem(req, res) {
  const { inventoryId } = req.params;
  const { fieldValues } = req.body;

  const inventory = await getInventoryByIdFromDb(inventoryId);

  if (!inventory) return sendError(res, "INVENTORY_NOT_FOUND", 404);

  const canWrite =
    inventory.ownerId === req.user.id ||
    inventory.accessList.some((a) => a.userId === req.user.id) ||
    inventory.isPublic === true;
  if (!canWrite && req.user.role !== 'admin') return sendError(res, "INVENTORY_NO_WRITE_ACCESS", 403);

  const fieldIds = fieldValues.map((f) => f.fieldId);
  const inventoryFields = await prisma.inventoryField.findMany({
    where: { inventoryId, id: { in: fieldIds } }
  });
  if (inventoryFields.length !== fieldValues.length) return sendError(res, "INVENTORY_INVALID_FIELDS", 400);

  const item = await createItemInDb(inventoryId, fieldValues);

  res.status(201).json(item);
}

export const getItems = async (req, res) => {
  try {
    const { inventoryId } = req.params;

    if (!inventoryId) return sendError(res, "ITEM_INVENTORY_ID_REQUIRED", 400);
    const items = await getItemsFromDb(inventoryId);

    return res.status(200).json(items);
  } catch (error) {
    console.error(error);
    return mapAndSendError(res, error);
  }
};

export const getInventoryStats = async (req, res) => {
  try {
    const { id } = req.params;
    const stats = await computeInventoryStats(id);
    return res.status(200).json(stats);
  } catch (error) {
    console.error(error);
    return mapAndSendError(res, error);
  }
};
