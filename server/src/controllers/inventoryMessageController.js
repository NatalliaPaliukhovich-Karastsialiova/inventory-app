import prisma from "../config/db.js";

export const createInventoryMessage = async ({ inventoryId, userId, text }) => {
  const message = await prisma.inventoryMessage.create({
    data: {
      inventoryId,
      userId,
      text,
    },
    include: {
      user: {
        select: {
          id: true,
          fullName: true,
          email: true,
          avatar: true,
        },
      },
    },
  });

  return message;
};

export const getInventoryMessages = async (inventoryId, limit = 50, cursor = null) => {
  return await prisma.inventoryMessage.findMany({
    where: { inventoryId },
    orderBy: { createdAt: 'desc' },
    take: limit,
    skip: cursor ? 1 : 0,
    cursor: cursor ? { id: cursor } : undefined,
    include: {
      user: {
        select: {
          id: true,
          fullName: true,
          email: true,
          avatar: true,
        },
      },
    },
  });
};
