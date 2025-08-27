import prisma from "../config/db.js";
import { mapAndSendError, sendError } from "../utils/http.js";
import { z } from "zod";

export const createInventoryMessage = async ({ inventoryId, userId, text }) => {
  const message = await prisma.inventoryMessage.create({
    data: {
      inventoryId,
      userId,
      text
    },
    include: {
      user: {
        select: {
          id: true,
          fullName: true,
          email: true,
          avatar: true
        }
      }
    }
  });

  return message;
};

export const getInventoryMessages = async (
  inventoryId,
  limit = 50,
  cursor = null
) => {
  return await prisma.inventoryMessage.findMany({
    where: { inventoryId },
    orderBy: { createdAt: "desc" },
    take: limit,
    skip: cursor ? 1 : 0,
    cursor: cursor ? { id: cursor } : undefined,
    include: {
      user: {
        select: {
          id: true,
          fullName: true,
          email: true,
          avatar: true
        }
      }
    }
  });
};

export async function loadMessages(req, res) {
  const { id } = req.params;
  const { limit, cursor } = req.query;

  try {
    const schema = z.object({
      limit: z.coerce.number().int().min(1).max(200).optional(),
      cursor: z.string().optional()
    });
    const parsed = schema.safeParse({ limit, cursor });
    if (!parsed.success) return sendError(res, "CHAT_FAILED_LOAD_MESSAGES", 400);
    const messages = await getInventoryMessages(
      id,
      parsed.data.limit || 50,
      parsed.data.cursor || null
    );
    res.json(messages);
  } catch (err) {
    console.error(err);
    return mapAndSendError(res, err);
  }
}
