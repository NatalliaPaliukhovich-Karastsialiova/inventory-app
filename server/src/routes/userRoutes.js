import { Router } from "express";
import { auth } from "../middleware/authMiddleware.js";
import { getProfile, searchUsers, updateProfile } from "../controllers/userController.js";

const router = Router();

router.get("/profile", auth("user"), getProfile);
router.patch("/profile", auth("user"), updateProfile);
router.get("/search", auth("user"), searchUsers);

export default router;
