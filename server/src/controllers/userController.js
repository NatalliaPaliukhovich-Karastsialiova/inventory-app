import {
  getUserProfile,
  updateProfileInDb,
  searchUsersInDb
} from "../models/userModel.js";
import { sendError, mapAndSendError } from "../utils/http.js";

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
    console.error(error);
    return mapAndSendError(res, error);
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
    return mapAndSendError(res, err);
  }
};
