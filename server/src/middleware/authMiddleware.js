import jwt from "jsonwebtoken";
import {
  canAccessInventory,
  canAccessItem,
  isOwnerOrAdmin
} from "../models/userModel.js";
const JWT_SECRET = process.env.JWT_SECRET;

export function auth(requiredRole = "user") {
  return (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      if (requiredRole === "guest") return next();
      return res.status(401).json({ error: "AUTH_AUTHORIZATION_REQUIRED" });
    }

    const token = authHeader.split(" ")[1];

    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      req.user = decoded;
      const rolesPriority = { guest: 0, user: 1, admin: 2 };
      if (rolesPriority[decoded.role] < rolesPriority[requiredRole]) {
        return res.status(403).json({ error: "AUTH_ACCESS_FORBIDDEN" });
      }

      next();
    } catch (err) {
      res.status(401).json({ error: "AUTH_INVALID_TOKEN" });
    }
  };
}

export const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "AUTH_UNAUTHORIZED" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await prisma.user.findUnique({ where: { id: decoded.id } });
    if (!user) return res.status(401).json({ message: "AUTH_UNAUTHORIZED" });

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ message: "AUTH_UNAUTHORIZED" });
  }
};

export const checkAccessByItem = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      req.writeAccess = false;
      return next();
    }
    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const isAccess = await canAccessItem(
      req.params.id,
      decoded.id,
      decoded.role
    );
    const ownerOrAdmin = await isOwnerOrAdmin(
      decoded.id,
      decoded.role,
      "item",
      req.params.id
    );
    req.writeAccess = !!isAccess;
    req.ownerOrAdmin = ownerOrAdmin;
    next();
  } catch (err) {
    console.log(err);
    return res.status(401).json({ message: "AUTH_UNAUTHORIZED" });
  }
};

export const checkAccessListByInventory = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      req.writeAccess = false;
      return next();
    }
    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const isAccess = await canAccessInventory(
      req.params.id,
      decoded.id,
      decoded.role
    );
    const ownerOrAdmin = await isOwnerOrAdmin(
      decoded.id,
      decoded.role,
      "inventory",
      req.params.id
    );
    req.writeAccess = !!isAccess;
    req.ownerOrAdmin = ownerOrAdmin;
    next();
  } catch (err) {
    console.log(err);
    return res.status(401).json({ message: "AUTH_UNAUTHORIZED" });
  }
};
