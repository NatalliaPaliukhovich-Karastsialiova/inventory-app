import { getUserProfile } from "../models/userModel.js";

export const getProfile = async (req, res) => {
  const user = await getUserProfile(req.user.id)
  return res.json(user);
}
