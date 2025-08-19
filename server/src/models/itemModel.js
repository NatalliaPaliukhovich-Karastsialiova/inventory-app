import prisma from "../config/db.js";

export async function getItemByIdFromDb(id) {
  return prisma.item.findUnique({
    where: { id },
    include: {
      inventory: {
        select: {
          id: true,
          title: true,
          inventoryField: true
        },
      },
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
          itemId_fieldId: { itemId: itemId, fieldId: fv.fieldId },
        },
        update: { value: fv.value },
        create: {
          itemId: itemId,
          fieldId: fv.fieldId,
          value: fv.value,
        },
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
          },
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
