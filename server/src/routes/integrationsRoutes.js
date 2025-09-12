import { Router } from "express";
import { auth } from "../middleware/authMiddleware.js";
import { syncCurrentUserToSalesforce } from "../controllers/integrationsController.js";

const router = Router();

router.post("/salesforce/sync-me", auth("user"), syncCurrentUserToSalesforce);

export default router;


