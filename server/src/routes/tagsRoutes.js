import { Router } from "express";
import { listTags, createTag, tagCloud } from "../controllers/tagsController.js";
import { auth } from "../middleware/authMiddleware.js";

const router = Router();

router.get("/", listTags);
router.post("/", auth("user"), createTag);
router.get("/cloud", tagCloud);

export default router;


