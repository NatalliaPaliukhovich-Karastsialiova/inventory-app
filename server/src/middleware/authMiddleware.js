import jwt from "jsonwebtoken";
import { sendError } from "../utils/http.js";
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
      return sendError(res, "AUTH_AUTHORIZATION_REQUIRED", 401);
    }

    const token = authHeader.split(" ")[1];

    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      req.user = decoded;
      const rolesPriority = { guest: 0, user: 1, admin: 2 };
      if (rolesPriority[decoded.role] < rolesPriority[requiredRole]) {
        return sendError(res, "AUTH_ACCESS_FORBIDDEN", 403);
      }

      next();
    } catch (err) {
      return sendError(res, "AUTH_INVALID_TOKEN", 401);
    }
  };
}

export const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return sendError(res, "AUTH_UNAUTHORIZED", 401);
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await prisma.user.findUnique({ where: { id: decoded.id } });
    if (!user) return sendError(res, "AUTH_UNAUTHORIZED", 401);

    req.user = user;
    next();
  } catch (err) {
    return sendError(res, "AUTH_UNAUTHORIZED", 401);
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
    req.user = decoded;
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
    return sendError(res, "AUTH_UNAUTHORIZED", 401);
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
    return sendError(res, "AUTH_UNAUTHORIZED", 401);
  }
};
