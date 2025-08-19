import prisma from "../config/db.js";

export async function createInventoryInDb(payload, ownerId) {
  const {
    title,
    description,
    category,
    imageUrl,
    tagIds = [],
    isPublic = false,
    accessList = []
  } = payload;
  return prisma.inventory.create({
    data: {
      title,
      description,
      category,
      imageUrl,
      isPublic,
      ownerId,
      tags: {
        create: tagIds.map((tagId) => ({ tagId }))
      },
      accessList: {
        create: accessList.map(({ userId }) => ({
          userId
        }))
      }
    },
    include: {
      tags: { include: { tag: true } },
      accessList: true
    }
  });
}

export async function getInventoryByIdFromDb(id) {
  return prisma.inventory.findUnique({
    where: { id },
    include: {
      tags: { include: { tag: true } },
      accessList: {
        include: {
          user: {
            select: {
              email: true,
              fullName: true,
              avatar: true,
              avatarFallback: true
            }
          }
        }
      },
      owner: true,
      customIdElements: true,
      inventoryField: true
    }
  });
}

export async function getInventoryByIdExternalFromDb(id) {
  return prisma.inventory.findUnique({
    where: { id },
    include: {
      owner: true,
      inventoryField: true
    }
  });
}

export async function updateInventoryInDb(id, payload) {
  const {
    title,
    description,
    category,
    imageUrl,
    tagIds,
    isPublic,
    accessList,
    customIdElements,
    inventoryField
  } = payload;
  return prisma.$transaction(async (prisma) => {
    const dataToUpdate = {
      ...(title && { title }),
      ...(description && { description }),
      ...(category && { category }),
      ...(imageUrl !== undefined && { imageUrl }),
      ...(isPublic !== undefined && { isPublic }),
      updatedAt: new Date(),
      version: { increment: 1 }
    };

    const updatedInventory = await prisma.inventory.update({
      where: { id },
      data: dataToUpdate
    });

    if (tagIds) {
      await prisma.inventoryTagOnItem.deleteMany({
        where: { inventoryId: id }
      });
      await prisma.inventoryTagOnItem.createMany({
        data: tagIds.map((tagId) => ({ inventoryId: id, tagId })),
        skipDuplicates: true
      });
    }

    if (accessList) {
      await prisma.inventoryAccess.deleteMany({ where: { inventoryId: id } });
      await prisma.inventoryAccess.createMany({
        data: accessList.map(({ userId }) => ({
          inventoryId: id,
          userId
        })),
        skipDuplicates: true
      });
    }

    if (Array.isArray(customIdElements)) {
      await prisma.customIdElement.deleteMany({ where: { inventoryId: id } });
      await prisma.customIdElement.createMany({
        data: customIdElements.map((el, index) => ({
          inventoryId: id,
          orderIndex: index,
          type: el.type,
          value: el.value || "",
          separator: el.separator || null
        })),
        skipDuplicates: true
      });
    }

    if (Array.isArray(inventoryField)) {
      const existingFields = await prisma.inventoryField.findMany({
        where: { inventoryId: id },
        select: { id: true }
      });

      const newFieldIds = inventoryField.map((f) => f.id).filter(Boolean);
      const fieldsToDelete = existingFields
        .filter((f) => !newFieldIds.includes(f.id))
        .map((f) => f.id);

      if (fieldsToDelete.length > 0) {
        await prisma.inventoryField.deleteMany({
          where: { id: { in: fieldsToDelete } }
        });
      }

      for (let i = 0; i < inventoryField.length; i++) {
        const field = inventoryField[i];
        if (field.id) {
          await prisma.inventoryField.update({
            where: { id: field.id },
            data: {
              label: field.label ?? "",
              description: field.description ?? "",
              type: field.type,
              showInTable: field.showInTable ?? false,
              orderIndex: i
            }
          });
        } else {
          await prisma.inventoryField.create({
            data: {
              inventoryId: id,
              label: field.label ?? "",
              description: field.description ?? "",
              type: field.type,
              showInTable: field.showInTable ?? false,
              orderIndex: i
            }
          });
        }
      }
    }

    return prisma.inventory.findUnique({
      where: { id },
      include: {
        tags: { include: { tag: true } },
        accessList: true,
        owner: true,
        customIdElements: true,
        inventoryField: true
      }
    });
  });
}

export async function deleteInventoryFromDb(id) {
  return prisma.inventory.delete({ where: { id } });
}

export async function listInventoriesFromDb() {
  return prisma.inventory.findMany({
    include: {
      tags: { include: { tag: true } },
      accessList: true,
      owner: true
    },
    orderBy: { createdAt: "desc" }
  });
}

export async function myListInventoriesFromDb(userId, type) {
  const where = {};

  if (type === "own") {
    where.ownerId = userId;
  } else if (type === "write") {
    where.ownerId = { not: userId };
    where.OR = [
      { isPublic: true },
      { accessList: { some: { userId: userId } } }
    ];
  }

  return prisma.inventory.findMany({
    where,
    include: {
      owner: true
    },
    orderBy: { createdAt: "desc" }
  });
}

export async function createItemInDb(inventoryId, fieldValues) {
  return prisma.$transaction(async (prisma) => {
    const inventory = await prisma.inventory.findUnique({
      where: { id: inventoryId },
      include: {
        accessList: true
      }
    });

    if (!inventory) {
      throw new Error("INVENTORY_NOT_FOUND");
    }

    const item = await prisma.item.create({
      data: {
        inventoryId,
        fieldValues: {
          create: fieldValues.map((f) => ({
            fieldId: f.fieldId,
            value: f.value
          }))
        }
      },
      include: {
        fieldValues: {
          include: { field: true }
        }
      }
    });
    return item;
  });
}

export async function getItemsFromDb(inventoryId) {
  return prisma.item.findMany({
    where: { inventoryId },
    include: {
      fieldValues: {
        include: {
          field: true
        }
      }
    }
  });
}

export async function updateItemInDb(itemId, fieldValues) {
  return prisma.$transaction(async (prisma) => {
    for (const fv of fieldValues) {
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
