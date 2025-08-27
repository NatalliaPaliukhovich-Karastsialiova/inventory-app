import prisma from "../config/db.js";
import { mapAndSendError } from "../utils/http.js";
import { z } from "zod";

export const searchController = async (req, res) => {
  const schema = z.object({
    q: z.string().trim().min(1).max(100)
  });

  const parsed = schema.safeParse({ q: (req.query.q || "").toString() });
  if (!parsed.success) return res.json({ inventories: [], items: [] });

  const q = parsed.data.q;
  const tagFilter = q.startsWith("tag:") ? q.slice(4).trim() : null;

  try {
    const inventories = tagFilter
      ? await prisma.inventory.findMany({
          where: {
            tags: {
              some: {
                tag: {
                  name: { startsWith: tagFilter, mode: "insensitive" }
                }
              }
            }
          },
          orderBy: { createdAt: "desc" },
          take: 50,
          select: {
            id: true,
            title: true,
            description: true,
            category: true,
            imageUrl: true,
            createdAt: true
          }
        })
      : await prisma.$queryRaw`
          SELECT id, title, description, category, "imageUrl", "createdAt"
          FROM "Inventory"
          WHERE (
            to_tsvector('simple', coalesce(title,'') || ' ' || coalesce(description,'')) @@ plainto_tsquery('simple', ${q})
            OR LOWER(title) LIKE LOWER(${`%${q}%`})
            OR LOWER(description) LIKE LOWER(${`%${q}%`})
          )
          ORDER BY "createdAt" DESC
          LIMIT 20
        `;

    const items = tagFilter
      ? []
      : await prisma.item.findMany({
          where: {
            customId: { contains: q, mode: "insensitive" }
          },
          orderBy: { createdAt: "desc" },
          take: 50,
          select: {
            id: true,
            inventoryId: true,
            createdAt: true,
            customId: true,
            inventory: { select: { title: true } },
            _count: { select: { likes: true } }
          }
        });

    res.json({ inventories, items });
  } catch (e) {
    console.error(e);
    return mapAndSendError(res, e);
  }
};
