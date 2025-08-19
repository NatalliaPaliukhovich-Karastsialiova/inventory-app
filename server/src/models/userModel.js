import prisma from "../config/db.js";
import { generateToken } from "../utils/cryptoUtils.js";
import { hashPassword, comparePassword } from "../utils/cryptoUtils.js";

export const createUser = async (email, password) => {
  const hashedPassword = await hashPassword(password);
  return prisma.user.create({
    data: { email, password: hashedPassword, role: "user" }
  });
};

export const updateUserPassword = async (email, password) => {
  const hashedPassword = await hashPassword(password);
  return prisma.user.update({
    where: { email },
    data: { password: hashedPassword }
  });
};

export const findUserByEmail = (email) =>
  prisma.user.findUnique({ where: { email } });

export const validatePassword = async (plain, hashed) =>
  comparePassword(plain, hashed);

export const isBlocked = (user) => user?.status === "blocked";

export const getUserProfile = async (id) => {
  const user = await prisma.user.findUnique({ where: { id: id } });
  user.token = generateToken(user);
  return user;
};

export const readAllUsers = () => prisma.user.findMany();

export const batchDeleteUsers = (ids) =>
  prisma.$transaction([
    prisma.user.deleteMany({
      where: { id: { in: ids } }
    })
  ]);

export const batchUpdateUsers = (ids, data) =>
  prisma.$transaction([
    prisma.user.updateMany({
      where: { id: { in: ids } },
      data
    })
  ]);

export const updateProfileInDb = (userId, givenName, familyName, avatar) =>
  prisma.user.update({
    where: { id: userId },
    data: {
      givenName,
      familyName,
      fullName: `${givenName} ${familyName}`,
      avatar
    }
  });

export const searchUsersInDb = (q) =>
  prisma.user.findMany({
    where: {
      OR: [
        { fullName: { contains: q, mode: "insensitive" } },
        { email: { contains: q, mode: "insensitive" } }
      ]
    },
    select: {
      id: true,
      fullName: true,
      email: true,
      avatar: true,
      avatarFallback: true
    },
    take: 10
  });

export const canAccessInventory = async (inventoryId, userId, role) => {
  if (role === "admin") return true;

  const inventory = await prisma.inventory.findFirst({
    where: {
      id: inventoryId,
      OR: [
        { ownerId: userId },
        { accessList: { some: { userId: userId } } },
        { isPublic: true }
      ]
    },
    select: { id: true }
  });

  return !!inventory;
};

export const canAccessItem = async (itemId, userId, role) => {
  if (role === "admin") return true;

  const item = await prisma.item.findFirst({
    where: {
      id: itemId,
      inventory: {
        OR: [
          { ownerId: userId },
          { accessList: { some: { userId: userId } } },
          { isPublic: true }
        ]
      }
    },
    select: { id: true }
  });

  return !!item;
};

export const isOwnerOrAdmin = async (userId, role, entity, entityId) => {
  if (role === "admin") return true;

  if (entity === "inventory") {
    const inventory = await prisma.inventory.findUnique({
      where: { id: entityId },
      select: { ownerId: true }
    });
    return !!inventory && inventory.ownerId === userId;
  }

  if (entity === "item") {
    const item = await prisma.item.findUnique({
      where: { id: entityId },
      select: { inventory: { select: { ownerId: true } } }
    });
    return !!item && item.inventory.ownerId === userId;
  }

  return false;
};
