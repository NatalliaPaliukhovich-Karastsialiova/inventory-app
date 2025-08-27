import prisma from "../config/db.js";
import { sendError, mapAndSendError } from "../utils/http.js";
import { z } from "zod";

const validate = (schema, data) => {
  const parsed = schema.safeParse(data);
  return parsed.success ? parsed.data : null;
};

export const listTags = async (req, res) => {
  try {
    const data = validate(z.object({ q: z.string().trim().optional() }), {
      q: req.query.q
    });
    const q = data?.q;

    const tags = await prisma.tag.findMany({
      where: q ? { name: { startsWith: q, mode: "insensitive" } } : {},
      orderBy: { name: "asc" },
      take: 20
    });

    res.json({ data: tags });
  } catch (e) {
    console.error(e);
    return mapAndSendError(res, e);
  }
};

export const createTag = async (req, res) => {
  try {
    const data = validate(
      z.object({ name: z.string().trim().min(1) }),
      req.body
    );
    if (!data) return sendError(res, "TAG_INVALID_NAME", 400);

    const existing = await prisma.tag.findFirst({
      where: { name: { equals: data.name, mode: "insensitive" } }
    });

    const tag = existing
      ? existing
      : await prisma.tag.create({
          data: { name: data.name }
        });

    res.status(201).json({ data: tag });
  } catch (e) {
    console.error(e);
    return mapAndSendError(res, e);
  }
};

export const tagCloud = async (_req, res) => {
  try {
    const tagCounts = await prisma.inventoryTagOnItem.groupBy({
      by: ["tagId"],
      _count: { inventoryId: true },
      orderBy: {
        _count: { inventoryId: "desc" }
      },
      take: 50
    });

    const tags = await prisma.tag.findMany({
      where: { id: { in: tagCounts.map((tc) => tc.tagId) } },
      select: { id: true, name: true }
    });

    const result = tagCounts
      .map((tc) => ({
        id: tc.tagId,
        name: tags.find((t) => t.id === tc.tagId)?.name || "",
        count: tc._count.inventoryId
      }))
      .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));

    res.json(result);
  } catch (e) {
    console.error(e);
    return mapAndSendError(res, e);
  }
};
