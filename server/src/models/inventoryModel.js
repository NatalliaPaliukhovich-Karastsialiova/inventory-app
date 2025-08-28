import prisma from "../config/db.js";
import {
  generateCustomId,
  validateCustomIdElements
} from "../utils/cryptoUtils.js";

export async function createInventoryInDb(payload, ownerId) {
  const {
    title,
    description,
    category,
    imageUrl,
    tags = [],
    isPublic = false,
    accessList = [],
    customIdElements = [],
    inventoryField = []
  } = payload;

  return prisma.$transaction(async (prisma) => {
    const resolvedTagIds = [];
    if (Array.isArray(tags)) {
      for (const t of tags) {
        if (t?.id) {
          resolvedTagIds.push(t.id);
        } else if (t?.name) {
          const existing = await prisma.tag.findFirst({
            where: { name: { equals: t.name, mode: "insensitive" } },
            select: { id: true }
          });
          const tag =
            existing ??
            (await prisma.tag.create({
              data: { name: t.name }
            }));
          resolvedTagIds.push(tag.id);
        }
      }
    }

    const inventory = await prisma.inventory.create({
      data: {
        title,
        description,
        category,
        imageUrl,
        isPublic,
        ownerId,
        tags: {
          create: resolvedTagIds.map((tagId) => ({ tagId }))
        },
        accessList: {
          create: accessList.map(({ userId }) => ({ userId }))
        }
      }
    });

    if (Array.isArray(customIdElements) && customIdElements.length > 0) {
      if (!validateCustomIdElements(customIdElements)) {
        const err = new Error("INVENTORY_INVALID_CUSTOM_ID");
        err.code = "INVENTORY_INVALID_CUSTOM_ID";
        throw err;
      }
      await prisma.customIdElement.createMany({
        data: customIdElements.map((el, index) => ({
          inventoryId: inventory.id,
          orderIndex: index,
          type: el.type,
          value: el.value || "",
          separator: el.separator || null
        })),
        skipDuplicates: true
      });
    } else {
      await prisma.customIdElement.create({
        data: {
          inventoryId: inventory.id,
          orderIndex: 0,
          type: "seq",
          value: "D",
          separator: null
        }
      });
    }

    if (Array.isArray(inventoryField) && inventoryField.length > 0) {
      for (let i = 0; i < inventoryField.length; i++) {
        const f = inventoryField[i];
        await prisma.inventoryField.create({
          data: {
            inventoryId: inventory.id,
            label: f.label ?? "",
            description: f.description ?? "",
            type: f.type,
            showInTable: f.showInTable ?? false,
            orderIndex: i
          }
        });
      }
    }

    return prisma.inventory.findUnique({
      where: { id: inventory.id },
      include: {
        tags: { include: { tag: true } },
        accessList: true,
        customIdElements: true,
        inventoryField: true
      }
    });
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
      inventoryField: true,
      tags: { include: { tag: true } }
    }
  });
}

export async function updateInventoryInDb(id, payload, expectedVersion) {
  const {
    title,
    description,
    category,
    imageUrl,
    tags,
    isPublic,
    accessList,
    customIdElements,
    inventoryField
  } = payload;
  if (Array.isArray(customIdElements)) {
    if (!validateCustomIdElements(customIdElements)) {
      const err = new Error("INVENTORY_INVALID_CUSTOM_ID");
      err.code = "INVENTORY_INVALID_CUSTOM_ID";
      throw err;
    }
  }
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

    const updateResult = await prisma.inventory.updateMany({
      where: {
        id,
        ...(typeof expectedVersion === "number" ? { version: expectedVersion } : {})
      },
      data: dataToUpdate
    });

    if (typeof expectedVersion === "number" && updateResult.count === 0) {
      const err = new Error("VERSION_CONFLICT");
      err.code = "VERSION_CONFLICT";
      throw err;
    }

    if (Array.isArray(tags)) {
      const resolvedIds = [];
      for (const t of tags) {
        if (t?.id) {
          resolvedIds.push(t.id);
        } else if (t?.name) {
          const existing = await prisma.tag.findFirst({
            where: { name: { equals: t.name, mode: "insensitive" } },
            select: { id: true }
          });
          const tag =
            existing ??
            (await prisma.tag.create({
              data: { name: t.name }
            }));
          resolvedIds.push(tag.id);
        }
      }
      const existing = await prisma.inventoryTagOnItem.findMany({
        where: { inventoryId: id },
        select: { tagId: true }
      });
      const existingSet = new Set(existing.map((e) => e.tagId));
      const incomingSet = new Set(resolvedIds);

      const toRemove = Array.from(existingSet).filter(
        (x) => !incomingSet.has(x)
      );
      const toAdd = Array.from(incomingSet).filter((x) => !existingSet.has(x));

      if (toRemove.length > 0) {
        await prisma.inventoryTagOnItem.deleteMany({
          where: { inventoryId: id, tagId: { in: toRemove } }
        });
      }
      if (toAdd.length > 0) {
        await prisma.inventoryTagOnItem.createMany({
          data: toAdd.map((tagId) => ({ inventoryId: id, tagId })),
          skipDuplicates: true
        });
      }
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
          await prisma.inventoryField.upsert({
            where: { id: field.id },
            update: {
              label: field.label ?? "",
              description: field.description ?? "",
              type: field.type,
              showInTable: field.showInTable ?? false,
              orderIndex: i
            },
            create: {
              id: field.id,
              inventoryId: id,
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
  return prisma.$transaction(async (prisma) => {
    const itemIds = (
      await prisma.item.findMany({
        where: { inventoryId: id },
        select: { id: true }
      })
    ).map((i) => i.id);
    if (itemIds.length) {
      await prisma.itemLike.deleteMany({ where: { itemId: { in: itemIds } } });
      await prisma.itemFieldValue.deleteMany({
        where: { itemId: { in: itemIds } }
      });
      await prisma.item.deleteMany({ where: { id: { in: itemIds } } });
    }

    await prisma.inventoryMessage.deleteMany({ where: { inventoryId: id } });
    await prisma.inventoryAccess.deleteMany({ where: { inventoryId: id } });
    await prisma.inventoryTagOnItem.deleteMany({ where: { inventoryId: id } });
    await prisma.customIdElement.deleteMany({ where: { inventoryId: id } });
    await prisma.inventoryField.deleteMany({ where: { inventoryId: id } });

    return prisma.inventory.delete({ where: { id } });
  });
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

    const customId = await generateCustomId(inventoryId);

    const item = await prisma.item.create({
      data: {
        inventoryId,
        customId,
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
      },
      _count: { select: { likes: true } }
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

export async function computeInventoryStats(inventoryId) {
  const totalItems = await prisma.item.count({ where: { inventoryId } });

  const itemsByDate = await prisma.$queryRaw`
    SELECT
      DATE("createdAt") as date,
      COUNT(*)::int as count
    FROM "Item"
    WHERE "inventoryId" = ${inventoryId}
    GROUP BY DATE("createdAt")
    ORDER BY date ASC
  `;

  const fields = await prisma.inventoryField.findMany({
    where: { inventoryId },
    orderBy: { orderIndex: "asc" },
    select: { id: true, label: true, type: true }
  });

  const perField = [];
  for (const f of fields) {
    if (f.type === "number") {
      const summaryRows =
        await prisma.$queryRaw`SELECT COUNT(*)::int as count, AVG((value)::numeric) as avg, MIN((value)::numeric) as min, MAX((value)::numeric) as max FROM "ItemFieldValue" WHERE "fieldId" = ${f.id} AND value ~ '^-?\\d+(\\.\\d+)?$'`;
      const summary = Array.isArray(summaryRows) ? summaryRows[0] : summaryRows;
      const count = Number(summary?.count ?? 0);
      const min = summary?.min != null ? Number(summary.min) : null;
      const max = summary?.max != null ? Number(summary.max) : null;
      const avg = summary?.avg != null ? Number(summary.avg) : null;

      let histogram = [];
      if (count > 0 && min != null && max != null) {
        if (max === min) {
          histogram = [{ bucket: 1, count: count }];
        } else {
          const buckets = await prisma.$queryRaw`WITH bounds AS (
              SELECT ${min}::numeric AS min, ${max}::numeric AS max
            ), data AS (
              SELECT (value)::numeric AS v FROM "ItemFieldValue" WHERE "fieldId" = ${f.id} AND value ~ '^-?\\d+(\\.\\d+)?$'
            )
            SELECT width_bucket(v, (SELECT min FROM bounds), (SELECT max FROM bounds), 10) AS bucket, COUNT(*)::int as count
            FROM data
            GROUP BY bucket
            ORDER BY bucket`;
          histogram = (Array.isArray(buckets) ? buckets : [buckets]).map(
            (b) => ({ bucket: Number(b.bucket), count: Number(b.count) })
          );
        }
      }

      perField.push({
        fieldId: f.id,
        label: f.label,
        type: f.type,
        stats: {
          count,
          avg,
          min,
          max,
          histogram
        }
      });
    } else if (f.type === "boolean") {
      const rows =
        await prisma.$queryRaw`SELECT SUM(CASE WHEN value='true' THEN 1 ELSE 0 END)::int as trueCount, SUM(CASE WHEN value='false' THEN 1 ELSE 0 END)::int as falseCount FROM "ItemFieldValue" WHERE "fieldId" = ${f.id}`;
      const row = Array.isArray(rows) ? rows[0] : rows;
      perField.push({
        fieldId: f.id,
        label: f.label,
        type: f.type,
        stats: {
          true: Number(row?.truecount ?? row?.trueCount ?? 0),
          false: Number(row?.falsecount ?? row?.falseCount ?? 0)
        }
      });
    } else {
      const top =
        await prisma.$queryRaw`SELECT value, COUNT(*)::int as count FROM "ItemFieldValue" WHERE "fieldId" = ${f.id} AND value IS NOT NULL AND value <> '' GROUP BY value ORDER BY COUNT(*) DESC LIMIT 3`;
      perField.push({
        fieldId: f.id,
        label: f.label,
        type: f.type,
        stats: {
          topValues: top.map((r) => ({
            value: r.value,
            count: Number(r.count)
          }))
        }
      });
    }
  }

  return { totalItems, perField, itemsByDate };
}
