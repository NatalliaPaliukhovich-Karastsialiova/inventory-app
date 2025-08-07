import prisma from "../config/db.js";

export const getProfile = async (req, res) => {
  const user = await prisma.user.findUnique({ where: { id: req.user.id } });
  return res.json(user);
}
