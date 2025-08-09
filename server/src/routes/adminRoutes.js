import { Router } from "express";
import { auth } from "../middleware/authMiddleware.js";
import { batchUsers, getAllUsers} from "../controllers/adminController.js";

const router = Router();

router.get("/users", auth("admin"), getAllUsers);
router.patch("/users/batch", auth("admin"), batchUsers);

export default router;
