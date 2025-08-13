import prisma from "../config/db.js";

export async function getItemById(req, res) {
  try {
    const { id } = req.params;

    const item = await prisma.item.findUnique({
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

    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }

    res.json(item);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch item' });
  }
}

export async function updateItem(req, res) {
  try {
    const { id } = req.params;
    const { fieldValues } = req.body;

    for (const fv of fieldValues) {
      await prisma.itemFieldValue.upsert({
        where: {
          itemId_fieldId: { itemId: id, fieldId: fv.fieldId },
        },
        update: { value: fv.value },
        create: {
          itemId: id,
          fieldId: fv.fieldId,
          value: fv.value,
        },
      });
    }

    const item = await prisma.item.findUnique({
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
    res.json(item);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to update item" });
  }
}
