import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { v4 as uuidv4 } from "uuid";
import prisma from "../config/db.js";
import crypto from "crypto";
import dayjs from "dayjs";

const JWT_SECRET = process.env.JWT_SECRET;

export async function hashPassword(password) {
  return bcrypt.hash(password, 10);
}

export async function comparePassword(password, hash) {
  return bcrypt.compare(password, hash);
}

export function generateToken(user) {
  return jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, {
    expiresIn: "4h"
  });
}

export function validateCustomIdElements(elements = []) {
  if (!Array.isArray(elements) || elements.length === 0) return false;
  for (const el of elements) {
    const type = el?.type;
    const value = (el?.value ?? "").toString();
    if (!type) return false;
    switch (type) {
      case "seq": {
        if (value && !/^(D\d{0,2})$/i.test(value.toUpperCase())) return false;
        break;
      }
      case "rand20": {
        if (value && !/^(D6|X5)$/i.test(value.toUpperCase())) return false;
        break;
      }
      case "rand32": {
        if (value && !/^(D10|X8)$/i.test(value.toUpperCase())) return false;
        break;
      }
      case "date": {
        if (value && !/^[YMDHms:\/\.\s-]*$/.test(value)) return false;
        break;
      }
      case "fixed":
      case "guid":
      case "rand6":
      case "rand9": {
        break;
      }
      default:
        return false;
    }
  }
  return true;
}

function escapeRegExp(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function regexForElement(el) {
  const type = el?.type;
  const value = (el?.value ?? "").toString();
  switch (type) {
    case "fixed":
      return escapeRegExp(value);
    case "guid":
      return "[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}";
    case "date": {
      let fmt = value || "YYYYMMDD";
      fmt = escapeRegExp(fmt);
      fmt = fmt.replace(/YYYY/g, "\\d{4}");
      fmt = fmt.replace(/MM/g, "\\d{2}");
      fmt = fmt.replace(/DD/g, "\\d{2}");
      fmt = fmt.replace(/HH/g, "\\d{2}");
      fmt = fmt.replace(/mm/g, "\\d{2}");
      fmt = fmt.replace(/ss/g, "\\d{2}");
      return fmt;
    }
    case "seq": {
      if (value && value.toUpperCase().startsWith("D")) {
        const minLength = parseInt(value.replace(/\D/g, ""), 10);
        return `\\d{${minLength},}`;
      }
      return `\\d{${1}}`;
    }
    case "rand6":
      return "\\d{6}";
    case "rand9":
      return "\\d{9}";
    case "rand20": {
      if (value && value.toUpperCase().startsWith("X")) return "[0-9a-fA-F]{5}";
      if (value && value.toUpperCase().startsWith("D")) return "\\d{6}";
      return "[0-9a-fA-F]{5}";
    }
    case "rand32": {
      if (value && value.toUpperCase().startsWith("X")) return "[0-9a-fA-F]{8}";
      if (value && value.toUpperCase().startsWith("D")) return "\\d{10}";
      return "[0-9a-fA-F]{8}";
    }
    default:
      return ".*";
  }
}

export function buildCustomIdRegex(elements = []) {
  const parts = [];
  for (const el of elements) {
    parts.push(regexForElement(el));
    if (el?.separator) parts.push(escapeRegExp(el.separator));
  }
  const full = `^${parts.join("")}$`;
  return new RegExp(full);
}

export function validateCustomIdFormat(customId, elements = []) {
  if (!Array.isArray(elements) || elements.length === 0) return true;
  const re = buildCustomIdRegex(elements);
  return re.test(customId || "");
}

export async function generateCustomId(inventoryId) {
  const elements = await prisma.customIdElement.findMany({
    where: { inventoryId },
    orderBy: { orderIndex: "asc" }
  });

  if (!elements.length) {
    throw new Error(
      `Custom ID format is not defined for inventory ${inventoryId}`
    );
  }

  const parts = [];
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
        const next = (await getNextSequence(inventoryId)).toString();
        const width = el.value ? parseInt(el.value.replace(/\D/g, ""), 10) : 0;
        part = next.length >= width ? next : next.padStart(width, "0");
        break;
      case "rand6":
        part = generateRandomByNumber(6);
        break;

      case "rand9":
        part = generateRandomByNumber(9);
        break;

      case "rand20":
        part = generateRandomByBits(20, el.value);
        break;

      case "rand32":
        part = generateRandomByBits(32, el.value);
        break;

      default:
        throw new Error(`Unknown type: ${el.type}`);
    }
    el.separator ? parts.push(part + el.separator) : parts.push(part);
  }
  return parts.join("");
}

async function getNextSequence(inventoryId) {
  const count = await prisma.item.count({
    where: { inventoryId }
  });
  return count + 1;
}

function generateRandomByBits(bits, value) {
  const base = value.includes("X") ? 16 : 10;
  const min = 2 ** (bits - 1);
  const max = 2 ** bits;
  const num = crypto.randomInt(min, max);
  return base === 16 ? num.toString(16).toUpperCase() : num.toString();
}

function generateRandomByNumber(digits) {
  const min = Math.pow(10, digits - 1);
  const max = Math.pow(10, digits);
  return crypto.randomInt(min, max).toString();
}
