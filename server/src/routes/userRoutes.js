import { Router } from "express";
import { auth } from "../middleware/authMiddleware.js";
import { getProfile } from "../controllers/userController.js";

const router = Router();

router.get("/profile", auth("USER"), getProfile);

export default router;
