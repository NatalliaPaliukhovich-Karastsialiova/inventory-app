import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { v4 as uuidv4 } from "uuid";
import prisma from "../config/db.js";
import crypto from "crypto";

const JWT_SECRET = process.env.JWT_SECRET;

export async function hashPassword(password) {
  return bcrypt.hash(password, 10);
}

export async function comparePassword(password, hash) {
  return bcrypt.compare(password, hash);
}

export function generateToken(user) {
  return jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, {
    expiresIn: "1h",
  });
}

export async function generateCustomId(inventoryId) {

  const elements = await prisma.customIdElement.findMany({
    where: { inventoryId },
    orderBy: { orderIndex: 'asc' }
  });

  if (!elements.length) {
    throw new Error(`Custom ID format is not defined for inventory ${inventoryId}`);
  }

  const parts = [];
  for (const el of elements) {
    let part = '';

    switch (el.type) {
      case 'fixed':
        part = el.value || '';
        break;

      case 'guid':
        part = uuidv4();
        break;

      case 'date':
        part = dayjs().format(el.value || 'YYYYMMDD');
        break;

      case 'seq':
        const seqNumber = await getNextSequence(inventoryId);
        const width = parseInt(el.value || '0', 10);
        part = width > 0
          ? seqNumber.toString().padStart(width, '0')
          : seqNumber.toString();
        break;

      case 'rand6':
        part = generateRandomByNumber(6);
        break;

      case 'rand9':
        part = generateRandomByNumber(9);
        break;

      case 'rand20':
        part = generateRandomByBits(20, el.value);
        break;

      case 'rand32':
        part = generateRandomByBits(32, el.value);
        break;

      default:
        throw new Error(`Unknown type: ${el.type}`);
    }
    (el.separator) ? parts.push(part + el.separator) : parts.push(part);
  }
  return parts.join('');
}


async function getNextSequence(inventoryId) {
  const count = await prisma.item.count({
    where: { inventoryId }
  });
  return count + 1;
}

function generateRandomByBits( bits, value) {
  const base = value.includes("X") ? 16 : 10;
  const min = 2 ** (bits - 1);
  const max = 2 ** bits;
  const num = crypto.randomInt(min, max);
  return base === 16 ? num.toString(16).toUpperCase() : num.toString();
}

function generateRandomByNumber( digits ) {
  const min = Math.pow(10, digits - 1);
  const max = Math.pow(10, digits);
  return crypto.randomInt(min, max).toString();
}
