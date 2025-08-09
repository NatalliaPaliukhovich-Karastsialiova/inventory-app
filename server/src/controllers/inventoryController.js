import prisma from "../config/db.js";

export async function createInventory(req, res) {
  try {
    const {
      title,
      description,
      category,
      imageUrl,
      tagIds = [],
      isPublic = false,
      ownerId,
      accessList = []
    } = req.body;

    const inventory = await prisma.inventory.create({
      data: {
        title,
        description,
        category,
        imageUrl,
        isPublic,
        ownerId,
        tags: {
          create: tagIds.map(tagId => ({ tagId }))
        },
        accessList: {
          create: accessList.map(({ userId, canWrite }) => ({
            userId,
            canWrite: canWrite ?? true,
          }))
        }
      },
      include: {
        tags: { include: { tag: true } },
        accessList: true,
      }
    });

    res.status(201).json(inventory);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create inventory' });
  }
}

export async function getInventoryById(req, res) {
  try {
    const { id } = req.params;

    const inventory = await prisma.inventory.findUnique({
      where: { id },
      include: {
        tags: { include: { tag: true } },
        accessList: true,
        owner: true,
      }
    });

    if (!inventory) {
      return res.status(404).json({ error: 'Inventory not found' });
    }

    res.json(inventory);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch inventory' });
  }
}

export async function updateInventory(req, res) {
  try {
    const { id } = req.params;
    const {
      title,
      description,
      category,
      imageUrl,
      tagIds,
      isPublic,
      accessList
    } = req.body;

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
      data: dataToUpdate,
    });

    if (tagIds) {
      await prisma.inventoryTagOnItem.deleteMany({ where: { inventoryId: id } });
      await prisma.inventoryTagOnItem.createMany({
        data: tagIds.map(tagId => ({ inventoryId: id, tagId })),
        skipDuplicates: true,
      });
    }

    if (accessList) {
      await prisma.inventoryAccess.deleteMany({ where: { inventoryId: id } });
      await prisma.inventoryAccess.createMany({
        data: accessList.map(({ userId, canWrite }) => ({
          inventoryId: id,
          userId,
          canWrite: canWrite ?? true,
        })),
        skipDuplicates: true,
      });
    }

    const result = await prisma.inventory.findUnique({
      where: { id },
      include: {
        tags: { include: { tag: true } },
        accessList: true,
        owner: true,
      }
    });

    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update inventory' });
  }
}


export async function deleteInventory(req, res) {
  try {
    const { id } = req.params;

    await prisma.inventory.delete({ where: { id } });

    res.json({ message: 'Inventory deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to delete inventory' });
  }
}


export async function listInventories(req, res) {
  try {
    const { ownerId, category } = req.query;

    const where = {};
    if (ownerId) where.ownerId = ownerId;
    if (category) where.category = category;

    const inventories = await prisma.inventory.findMany({
      where,
      include: {
        tags: { include: { tag: true } },
        accessList: true,
        owner: true,
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(inventories);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch inventories' });
  }
}
