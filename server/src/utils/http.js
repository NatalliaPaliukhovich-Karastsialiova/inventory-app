export function sendError(res, code = "COMMON_SERVER_ERROR", status = 400) {
  return res.status(status).json({ error: code });
}

export function mapAndSendError(res, error) {
  if (!error) return sendError(res, "COMMON_SERVER_ERROR", 500);
  const code = error.code || error.error || error.message;
  switch (code) {
    case "VERSION_CONFLICT":
      return sendError(res, code, 409);
    case "INVENTORY_NOT_FOUND":
    case "ITEM_NOT_FOUND":
      return sendError(res, code, 404);
    case "INVENTORY_NO_WRITE_ACCESS":
      return sendError(res, code, 403);
    case "ITEM_INVALID_CUSTOM_ID":
    case "TAG_INVALID_NAME":
    case "ADMIN_IDS_ARRAY_REQUIRED":
    case "ADMIN_ACTION_REQUIRED":
    case "ADMIN_UNKNOWN_ACTION":
    case "INVENTORY_INVALID_CUSTOM_ID":
    case "INVENTORY_INVALID_FIELDS":
      return sendError(res, code, 400);
    case "AUTH_TOKEN_GENERATION_ERROR":
    case "AUTH_CREATE_USER_ERROR":
    case "PROFILE_FAILED_UPDATE":
      return sendError(res, code, 500);
    case "INTEGRATION_SFDC_MISCONFIGURED":
    case "INTEGRATION_SFDC_API_ERROR":
      return sendError(res, code, 500);
    default:
      return sendError(res, "COMMON_SERVER_ERROR", 500);
  }
}


