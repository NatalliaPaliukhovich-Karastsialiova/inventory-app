import prisma from "../config/db.js";
import { validateCustomIdFormat } from "../utils/cryptoUtils.js";

export async function getItemByIdFromDb(id) {
  return prisma.item.findUnique({
    where: { id },
    include: {
      inventory: {
        select: {
          id: true,
          title: true,
          inventoryField: true,
          customIdElements: true
        }
      },
      fieldValues: {
        include: {
          field: true
        }
      }
    }
  });
}

export async function updateItemInDb(itemId, fieldValues, customId, version) {
  return prisma.$transaction(async (prisma) => {
    if (typeof customId === "string") {
      const item = await prisma.item.findUnique({
        where: { id: itemId },
        select: { inventoryId: true }
      });
      if (item?.inventoryId) {
        const elements = await prisma.customIdElement.findMany({
          where: { inventoryId: item.inventoryId },
          orderBy: { orderIndex: "asc" }
        });
        const ok = validateCustomIdFormat(customId, elements);
        if (!ok) {
          const err = new Error("ITEM_INVALID_CUSTOM_ID");
          err.code = "ITEM_INVALID_CUSTOM_ID";
          throw err;
        }
      }
    }
    const updated = await prisma.item.updateMany({
      where: { id: itemId, version: version },
      data: {
        version: { increment: 1 },
        updatedAt: new Date(),
        customId: customId
      }
    });
    if (updated.count === 0) {
      const err = new Error("VERSION_CONFLICT");
      err.code = "VERSION_CONFLICT";
      throw err;
    }

    const filteredFieldValues = fieldValues.filter(
      (fv) => fv.fieldId !== "customId"
    );

    for (const fv of filteredFieldValues) {
      await prisma.itemFieldValue.upsert({
        where: {
          itemId_fieldId: { itemId: itemId, fieldId: fv.fieldId }
        },
        update: { value: fv.value },
        create: {
          itemId: itemId,
          fieldId: fv.fieldId,
          value: fv.value
        }
      });
    }

    const item = await prisma.item.findUnique({
      where: { id: itemId },
      include: {
        inventory: {
          select: {
            id: true,
            title: true,
            inventoryField: true
          }
        },
        fieldValues: {
          include: {
            field: true
          }
        }
      }
    });
    return item;
  });
}

export async function addLikeToItem(itemId, userId) {
  return prisma.itemLike.create({
    data: { itemId, userId }
  });
}

export async function removeLikeFromItem(itemId, userId) {
  return prisma.itemLike.delete({
    where: { itemId_userId: { itemId, userId } }
  });
}

export async function getItemLikesCount(itemId) {
  return prisma.itemLike.count({ where: { itemId } });
}

export async function hasUserLikedItem(itemId, userId) {
  if (!userId) return false;
  const like = await prisma.itemLike.findUnique({
    where: { itemId_userId: { itemId, userId } },
    select: { id: true }
  });
  return !!like;
}

export async function deleteItemFromDb(itemId) {
  return prisma.item.delete({ where: { id: itemId } });
}

export async function batchDeleteItemsFromDb(ids) {
  return prisma.item.deleteMany({ where: { id: { in: ids } } });
}
