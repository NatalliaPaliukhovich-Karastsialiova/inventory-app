import { z } from "zod";
import dayjs from "dayjs";
import { v4 as uuidv4 } from "uuid";
import type { CustomIDField } from "@/types";

const baseInventorySchema = z.object({
  title: z.string(),
  description: z.string().optional(),
  category: z.string(),
  imageUrl: z.string().optional().nullable(),
  tags: z.array(z.string()).optional(),
  isPublic: z.boolean().optional(),
  accessUsers: z
    .array(
      z.object({
        id: z.string(),
        name: z.string(),
        email: z.string().optional()
      })
    )
    .optional()
});

export type InventorySettingSchema = z.infer<typeof baseInventorySchema>;

export const inventorySchema = (t: (key: string) => string) => {
  return baseInventorySchema.extend({
    title: z.string().min(1, t("inventory.settings.titleRequired")),
    description: z.string().optional(),
    category: z.string().min(1, t("inventory.settings.categoryRequired")),
    imageUrl: z.string().optional().nullable(),
    tags: z.array(z.string()).optional(),
    isPublic: z.boolean().optional(),
    accessUsers: z
      .array(
        z.object({
          id: z.string(),
          name: z.string(),
          email: z.string().optional()
        })
      )
      .optional()
  });
};

export function generateCustomIdPreview(elements: CustomIDField[]): string {
  if (!elements || elements.length === 0) {
    return "";
  }

  const parts: string[] = [];
  for (const el of elements) {
    let part = "";
    switch (el.type) {
      case "fixed":
        part = el.value || "";
        break;
      case "guid":
        part = uuidv4();
        break;
      case "date":
        part = dayjs().format(el.value || "YYYYMMDD");
        break;
      case "seq":
        const width = (el.value) ? parseInt(el.value.replace(/\D/g, ""), 10) : 0;
        part = ("1".length >= width) ? "1" : "1".padStart(width, "0");
        break;
      case "rand6":
        part = Math.floor(100000 + Math.random() * 900000).toString();
        break;
      case "rand9":
        part = Math.floor(100000000 + Math.random() * 900000000).toString();
        break;
      case "rand20":
        if (el.value) {
          const width = parseInt(el.value.replace(/\D/g, ""), 10) ?? 0;
          part = generateRandomPart(el.value, width);
          break;
        }
        break;
      case "rand32":
        if (el.value) {
          const width = parseInt(el.value.replace(/\D/g, ""), 10) ?? 0;
          part = generateRandomPart(el.value, width);
          break;
        }
        break;
      default:
        part = `[${el.type}]`;
    }
    parts.push(part);
    if (el.separator) {
      parts.push(el.separator);
    }
  }
  return parts.join("");
}

function escapeRegExp(string: string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function getRegexForCustomIdType(element: CustomIDField): string {
  switch (element.type) {
    case "fixed":
      return escapeRegExp(element.value || "");
    case "guid":
      return "[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}";
    case "date":
      let format = element.value || "YYYYMMDD";
      format = escapeRegExp(format);
      format = format.replace(/YYYY/g, "\\d{4}");
      format = format.replace(/MM/g, "\\d{2}");
      format = format.replace(/DD/g, "\\d{2}");
      format = format.replace(/HH/g, "\\d{2}");
      format = format.replace(/mm/g, "\\d{2}");
      format = format.replace(/ss/g, "\\d{2}");
      return format;
    case "seq":
      if (element.value && element.value.toUpperCase().startsWith("D")) {
        const minLength = parseInt(element.value.replace(/\D/g, ""), 10);
        return `\\d{${minLength},}`;
      }
      return `\\d{${1}}`;
    case "rand6":
      return "\\d{6}";
    case "rand9":
      return "\\d{9}";
    case "rand20":
      if (element.value && element.value.toUpperCase().startsWith("X")) {
        const hexDigits = 5;
        return `[0-9a-fA-F]{${hexDigits}}`;
      } else if (element.value && element.value.toUpperCase().startsWith("D")) {
        const decDigits = 6;
        return `\\d{${decDigits}}`;
      }
      return `[0-9a-fA-F]{5}`;
    case "rand32":
      if (element.value && element.value.toUpperCase().startsWith("X")) {
        const hexDigits = 8;
        return `[0-9a-fA-F]{${hexDigits}}`;
      } else if (element.value && element.value.toUpperCase().startsWith("D")) {
        const decDigits = 10;
        return `\\d{${decDigits}}`;
      }
      return `[0-9a-fA-F]{8}`;
    default:
      return ".*";
  }
}

export function validateCustomId(customId: string, elements: CustomIDField[]): boolean {
  if (!elements || elements.length === 0) {
    return true;
  }

  const regexParts: string[] = [];
  for (const el of elements) {
    if (el.type === "fixed" && !el.value) {
      continue;
    }
    regexParts.push(getRegexForCustomIdType(el));
    if (el.separator) {
      regexParts.push(escapeRegExp(el.separator));
    }
  }
  const fullRegex = new RegExp(`^${regexParts.join("")}$`);
  return fullRegex.test(customId);
}

function generateRandomPart(value: string, digits: number) {
  let part = "";

  if(!digits) return part;

  if (value.includes("D")) {
    const min = 10 ** (digits - 1);
    const max = 10 ** digits - 1;
    part = (Math.floor(Math.random() * (max - min + 1)) + min).toString();
  } else if (value.includes("X")) {
    const max = 16 ** digits - 1;
    const num = Math.floor(Math.random() * (max + 1));
    part = num.toString(16).toUpperCase().padStart(digits, "0");
  }

  return part;
}
