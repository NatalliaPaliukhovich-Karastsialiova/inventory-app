import prisma from "../config/db.js";
import { generateToken } from "../utils/cryptoUtils.js";

export const getUserProfile = async (id) => {
  const user = await prisma.user.findUnique({ where: { id: id } });
  user.token = generateToken (user);
  return user;
}
