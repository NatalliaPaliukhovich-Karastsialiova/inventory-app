import prisma from "../config/db.js";

export const getAllUsers = async (req, res) => {
  const users = await prisma.user.findMany();
  return res.json(users);
}

export const batchUsers = async (req, res) => {
  try {
    const { ids, action } = req.body;

    if (!Array.isArray(ids) || !ids.length) {
      return res.status(400).json({ error: "IDs array required" });
    }
    if (!action) {
      return res.status(400).json({ error: "Action is required" });
    }

    let update;
    switch (action) {
      case "block":
        update = { status: "blocked" };
        break;
      case "unblock":
        update = { status: "active" };
        break;
      case "make-admin":
        update = { role: "admin" };
        break;
      case "remove-admin":
        update = { role: "user" };
        break;
      case "delete":
        await prisma.user.deleteMany({
          where: {
            id: { in: ids },
          }
        });
        return res.json({ message: "Users deleted" });
      default:
        return res.status(400).json({ error: "Unknown action" });
    }

    await prisma.user.updateMany({
      where: {
        id: { in: ids },
      },
      data: update,
    });
    res.json({ message: `Action '${action}' applied` });
  } catch (e) {
    console.log(e)
    res.status(500).json({ error: "Server error" });
  }
};
