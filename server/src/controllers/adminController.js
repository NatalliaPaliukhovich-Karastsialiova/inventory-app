import prisma from "../config/db.js";

export const getAllUsers = async (req, res) => {
  const users = await prisma.user.findMany();
  return res.json(users);
}
