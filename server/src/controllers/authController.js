import { getUserProfile, findUserByEmail, validatePassword, isBlocked, createUser } from "../models/userModel.js";

export const registerWebUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "AUTH_MISSING_CREDENTIALS" });
    }

    const existingUser = await findUserByEmail(email);

    if (existingUser && existingUser.password) {
      return res.status(400).json({ error: "AUTH_EMAIL_ALREADY_IN_USE" });
    }

    let currentUser;
    if (!existingUser) {
      currentUser = await createUser(email, password);
    } else {
      currentUser = await updateUserPassword(email, password);
    }

    const profile = await getUserProfile(currentUser.id)
    res.json(profile);
  } catch (err) {
    res.status(500).json({ error: "AUTH_CREATE_USER_ERROR" });
  }
};

export const loginWebUser = async (req, res) => {
  try{
    const { email, password } = req.body;
    const user = await findUserByEmail(email);

    if (!user) {
      return res.status(404).json({ error: "AUTH_USER_NOT_FOUND" });
    }

    if (isBlocked(user)) {
      return res.status(403).json({ error: "AUTH_USER_BLOCKED" });
    }

    if (!user.password && password) {
      return res.status(401).json({ error: "AUTH_USER_NOT_REGISTERED_WITH_EMAIL_PASSWORD" });
    }

    if (!(await validatePassword(password, user.password))) {
      return res.status(401).json({ error: "AUTH_INVALID_CREDENTIALS" });
    }

    const profile = await getUserProfile(user.id)
    return res.json(profile);
  } catch (err) {
    res.status(500).json({ error: "AUTH_TOKEN_GENERATION_ERROR" });
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
