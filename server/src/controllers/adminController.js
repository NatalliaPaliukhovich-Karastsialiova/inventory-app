import {batchDeleteUsers, readAllUsers, batchUpdateUsers} from "../models/userModel.js";
import { sendError, mapAndSendError } from "../utils/http.js";
import { z } from "zod";

export const getAllUsers = async (req, res) => {
  try {
    const users = await readAllUsers();
    res.json(users);
  } catch (e) {
    console.error(e);
    return mapAndSendError(res, e);
  }
}

export const batchUsers = async (req, res) => {
  try {
    const schema = z.object({
      ids: z.array(z.string().min(1)).min(1),
      action: z.enum(["delete", "block", "unblock", "make-admin", "remove-admin"])
    });
    const parsed = schema.safeParse(req.body || {});
    if (!parsed.success) return sendError(res, "ADMIN_ACTION_REQUIRED", 400);
    const { ids, action } = parsed.data;

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
    if (!updateData) return sendError(res, "ADMIN_UNKNOWN_ACTION", 400);

    await batchUpdateUsers(ids, updateData);
    res.json({ message: "ADMIN_ACTION_APPLIED_SUCCESS" });
  } catch (e) {
    console.log(e)
    return mapAndSendError(res, e);
  }
};
