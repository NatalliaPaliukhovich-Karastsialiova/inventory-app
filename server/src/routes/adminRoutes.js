import { Router } from "express";
import { auth } from "../middleware/authMiddleware.js";
import { getAllUsers } from "../controllers/adminController.js";

const router = Router();

router.get("/users", auth("ADMIN"), getAllUsers);

export default router;
