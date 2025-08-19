import {
  getUserProfile,
  updateProfileInDb,
  searchUsersInDb
} from "../models/userModel.js";
import prisma from "../config/db.js";

export const getProfile = async (req, res) => {
  const user = await getUserProfile(req.user.id);
  return res.json(user);
};

export const updateProfile = async (req, res) => {
  const userId = req.user.id;
  const { givenName, familyName, avatar } = req.body;
  try {
    const updatedUser = await updateProfileInDb(
      userId,
      givenName,
      familyName,
      avatar
    );

    const user = await getUserProfile(req.user.id);
    return res.json(user);
  } catch (error) {
    console.error("PROFILE_FAILED_UPDATE", error);
    return res.status(500).json({ message: "PROFILE_FAILED_UPDATE" });
  }
};

export const searchUsers = async (req, res) => {
  try {
    const q = req.query.q?.trim() || "";
    if (!q) {
      return res.json([]);
    }
    const users = await searchUsersInDb(q);

    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "COMMON_SERVER_ERROR" });
  }
};
