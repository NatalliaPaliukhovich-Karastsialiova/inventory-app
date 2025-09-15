import { mapAndSendError, sendError } from "../utils/http.js";
import { getUserProfile, setSalesforceAccountId } from "../models/userModel.js";
import { createSalesforceAccountAndContact } from "../services/salesforceService.js";
import { uploadJsonToDropbox } from "../services/dropboxService.js";
import { getInventoryByIdFromDb } from "../models/inventoryModel.js";

export const syncCurrentUserToSalesforce = async (req, res) => {
  try {
    const user = await getUserProfile(req.user.id);
    if (!user) return sendError(res, "AUTH_USER_NOT_FOUND", 404);

    const { accountName, phone, companyWebsite } = req.body || {};

    const result = await createSalesforceAccountAndContact({
      accountName: accountName || user.fullName || user.email,
      contact: {
        firstName: user.givenName || undefined,
        lastName: user.familyName || user.fullName || user.email,
        email: user.email,
        phone: phone || undefined,
        website: companyWebsite || undefined
      }
    });

    if (result?.accountId) {
      await setSalesforceAccountId(req.user.id, result.accountId);
    }

    const updated = await getUserProfile(req.user.id);
    return res.json({ ...result, user: updated });
  } catch (error) {
    console.error(error);
    return mapAndSendError(res, error);
  }
};

export const createSupportTicket = async (req, res) => {
  try {
    const { summary, priority, link, inventoryId } = req.body || {};
    if (!summary || !priority || !link) {
      return sendError(res, "TICKET_INVALID_PAYLOAD", 400);
    }
    const user = await getUserProfile(req.user.id);
    if (!user) return sendError(res, "AUTH_USER_NOT_FOUND", 404);

    let inventory = null;
    if (inventoryId) {
      inventory = await getInventoryByIdFromDb(inventoryId);
      if (!inventory) return sendError(res, "INVENTORY_NOT_FOUND", 404);
    }

    const ticket = {
      reportedBy: { email: user.email, name: user.fullName },
      inventory: inventory?.title || null,
      link,
      priority,
      summary,
      adminEmail: process.env.ADMIN_EMAIL
    };

    const fileName = `ticket_${Date.now()}.json`;
    const path = `/support/${fileName}`;
    const uploadResult = await uploadJsonToDropbox(path, ticket);

    return res.json({ ok: true, path, id: uploadResult?.id || null });
  } catch (error) {
    console.error(error);
    return mapAndSendError(res, error);
  }
};


