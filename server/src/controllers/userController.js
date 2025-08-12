import { getUserProfile } from "../models/userModel.js";
import prisma from "../config/db.js";

export const getProfile = async (req, res) => {
  const user = await getUserProfile(req.user.id)
  return res.json(user);
}

export const updateProfile = async (req, res) => {
  const userId = req.user.id;
  const { givenName, familyName, avatar } = req.body;
  try {
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        givenName,
        familyName,
        fullName: `${givenName} ${familyName}`,
        avatar
      },
    });

    const user = await getUserProfile(req.user.id)
    return res.json(user);
  } catch (error) {
    console.error("Failed to update profile:", error);
    return res.status(500).json({ message: "Failed to update profile" });
  }
}

export const searchUsers = async (req, res) => {
  try {
    const q = (req.query.q)?.trim() || '';
    if (!q) {
      return res.json([]);
    }
    const users = await prisma.user.findMany({
      where: {
        OR: [
          { fullName: { contains: q, mode: 'insensitive' } },
          { email: { contains: q, mode: 'insensitive' } },
        ],
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        avatar: true,
        avatarFallback: true
      },
      take: 10,
    });

    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
}
