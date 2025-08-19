import {batchDeleteUsers, readAllUsers, batchUpdateUsers} from "../models/userModel.js";

export const getAllUsers = async (req, res) => {
  try {
    const users = await readAllUsers();
    res.json(users);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "COMMON_SERVER_ERROR" });
  }
}

export const batchUsers = async (req, res) => {
  try {
    const { ids, action } = req.body;

    if (!Array.isArray(ids) || !ids.length) {
      return res.status(400).json({ error: "ADMIN_IDS_ARRAY_REQUIRED" });
    }
    if (!action) {
      return res.status(400).json({ error: "ADMIN_ACTION_REQUIRED" });
    }

    if (action === "delete") {
      await batchDeleteUsers(ids);
      return res.json({ message: "ADMIN_USERS_DELETED_SUCCESS" });
    }

    const actionMap = {
      "block": { status: "blocked" },
      "unblock": { status: "active" },
      "make-admin": { role: "admin" },
      "remove-admin": { role: "user" }
    };

    const updateData = actionMap[action];
    if (!updateData) {
      return res.status(400).json({ error: "ADMIN_UNKNOWN_ACTION" });
    }

    await batchUpdateUsers(ids, updateData);
    res.json({ message: "ADMIN_ACTION_APPLIED_SUCCESS" });
  } catch (e) {
    console.log(e)
    res.status(500).json({ error: "COMMON_SERVER_ERROR" });
  }
};
