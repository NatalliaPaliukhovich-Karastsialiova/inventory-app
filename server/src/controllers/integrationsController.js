import { mapAndSendError, sendError } from "../utils/http.js";
import { getUserProfile, setSalesforceAccountId } from "../models/userModel.js";
import { createSalesforceAccountAndContact } from "../services/salesforceService.js";

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


