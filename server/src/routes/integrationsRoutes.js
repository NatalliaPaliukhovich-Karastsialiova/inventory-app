import { Router } from "express";
import { auth } from "../middleware/authMiddleware.js";
import { syncCurrentUserToSalesforce, createSupportTicket } from "../controllers/integrationsController.js";

const router = Router();

router.post("/salesforce/sync-me", auth("user"), syncCurrentUserToSalesforce);
router.post("/ticket", auth("user"), createSupportTicket);

export default router;


