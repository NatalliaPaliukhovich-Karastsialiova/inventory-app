import axios from "axios";

const SFDC_LOGIN_URL = process.env.SFDC_LOGIN_URL;
const SFDC_CLIENT_ID = process.env.SFDC_CLIENT_ID;
const SFDC_CLIENT_SECRET = process.env.SFDC_CLIENT_SECRET;


async function getAccessToken() {
  const form = new URLSearchParams();
  form.append("grant_type", "client_credentials");
  form.append("client_id", SFDC_CLIENT_ID);
  form.append("client_secret", SFDC_CLIENT_SECRET);

  const { data } = await axios.post(`${SFDC_LOGIN_URL}/services/oauth2/token`, form, {
    headers: { "Content-Type": "application/x-www-form-urlencoded" }
  });
  return data;
}

export async function createSalesforceAccountAndContact({ accountName, contact }) {
  try {
    const { access_token, instance_url } = await getAccessToken();
    const authHeader = { Authorization: `Bearer ${access_token}` };

    const accountPayload = {
      Name: accountName,
      Website: contact?.website || undefined,
      Phone: contact?.phone || undefined
    };
    const accountRes = await axios.post(
      `${instance_url}/services/data/v61.0/sobjects/Account`,
      accountPayload,
      { headers: { ...authHeader, "Content-Type": "application/json" } }
    );

    const accountId = accountRes.data?.id;

    const contactPayload = {
      FirstName: contact?.firstName || undefined,
      LastName: contact?.lastName || accountName,
      Email: contact?.email,
      AccountId: accountId,
      Phone: contact?.phone || undefined
    };
    const contactRes = await axios.post(
      `${instance_url}/services/data/v61.0/sobjects/Contact`,
      contactPayload,
      { headers: { ...authHeader, "Content-Type": "application/json" } }
    );

    return {
      accountId,
      contactId: contactRes.data?.id
    };
  } catch (err) {
    const error = new Error("Salesforce API error");
    error.code = "INTEGRATION_SFDC_API_ERROR";
    error.details = err?.response?.data || err?.message;
    throw error;
  }
}


