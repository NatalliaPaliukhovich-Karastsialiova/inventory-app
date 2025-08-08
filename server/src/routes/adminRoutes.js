import { Router } from "express";
import { auth } from "../middleware/authMiddleware.js";
import { getAllUsers } from "../controllers/adminController.js";

const router = Router();

router.get("/users", auth("admin"), getAllUsers);

export default router;
