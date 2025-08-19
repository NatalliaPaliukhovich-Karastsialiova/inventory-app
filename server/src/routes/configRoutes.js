import { Router } from "express";
import { codeLists } from "../config/codelists.js";

const router = Router();

router.get("/", (req, res) => {
  res.json(codeLists);
});

export default router;
