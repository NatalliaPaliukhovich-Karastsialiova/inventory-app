import { getUserProfile, findUserByEmail, validatePassword, isBlocked, createUser, updateUserPassword } from "../models/userModel.js";
import { sendError, mapAndSendError } from "../utils/http.js";

export const registerWebUser = async (req, res) => {
  try {
    const { email, password, givenName, familyName } = req.body;

    if (!email || !password) return sendError(res, "AUTH_MISSING_CREDENTIALS", 400);

    const existingUser = await findUserByEmail(email);

    if (existingUser && existingUser.password) return sendError(res, "AUTH_EMAIL_ALREADY_IN_USE", 400);

    let currentUser;
    if (!existingUser) {
      currentUser = await createUser(email, password, givenName, familyName);
    } else {
      currentUser = await updateUserPassword(email, password);
    }

    const profile = await getUserProfile(currentUser.id)
    res.json(profile);
  } catch (err) {
    return mapAndSendError(res, err);
  }
};

export const loginWebUser = async (req, res) => {
  try{
    const { email, password } = req.body;
    const user = await findUserByEmail(email);

    if (!user) return sendError(res, "AUTH_USER_NOT_FOUND", 404);

    if (isBlocked(user)) return sendError(res, "AUTH_USER_BLOCKED", 403);

    if (!user.password && password) return sendError(res, "AUTH_USER_NOT_REGISTERED_WITH_EMAIL_PASSWORD", 401);

    if (!(await validatePassword(password, user.password))) return sendError(res, "AUTH_INVALID_CREDENTIALS", 401);

    const profile = await getUserProfile(user.id)
    return res.json(profile);
  } catch (err) {
    return mapAndSendError(res, err);
  }
};

export const socialCallbackController = async (req, res) => {
  const user = req.user;
  let error = null;

  if (!user) {
    error = "AUTH_UNAUTHORIZED";
  } else if (isBlocked(user)) {
    error = "AUTH_USER_BLOCKED";
  }

  if (error) {
    return res.send(`
    <script>
      window.opener.postMessage(${JSON.stringify({ error })}, '*');
      window.close();
    </script>
    `);
  }

  const profile = await getUserProfile(user.id);

  res.send(`
    <script>
      window.opener.postMessage(${JSON.stringify(profile)}, '*');
      window.close();
    </script>
  `);
}
