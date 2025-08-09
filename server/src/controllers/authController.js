import prisma from "../config/db.js";
import { hashPassword, comparePassword } from "../utils/cryptoUtils.js";
import { getUserProfile } from "../models/userModel.js";

export const registerWebUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ error: "Email and Password are required!" });

    const existingUser = await prisma.user.findUnique({ where: { email } });

    if (existingUser && existingUser.password)
      return res.status(400).json({ error: "Email already in use." });

    const hashedPassword = await hashPassword(password);
    let currentUser;
    if (!existingUser) {
      currentUser = await prisma.user.create({
      data: { email, password: hashedPassword, role: "user" },
    });
    } else {
      currentUser = await prisma.user.update({
        where: { email },
        data: { password: hashedPassword },
      });
    }
    const profile = await getUserProfile(currentUser.id)
    res.json(profile);
  } catch (err) {
    return res.status(500).json({ error: `Error creating user, ${err.message}`});
  }
};

export const loginWebUser = async (req, res) => {
  try{
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(404).json({ error: "User doesn't exist"});
    }
    if (user.status === 'blocked') {
      return res.status(403).json({ error: "User blocked"});
    }
    if(!user.password && password)
      return res.status(401).json({ error: "User wasn't registered by Email and Password." });
    if (!(await comparePassword(password, user.password)))
      return res.status(401).json({ error: "Invalid email or password." });
      const profile = await getUserProfile(user.id)
    return res.json(profile);
  } catch (err) {
    return res.status(500).json({ error: `Error generating token., ${err.message}`});
  }
};

export const socialCallbackController = async (req, res) => {
  const user = req.user;
  let error = null;

  if (!user) {
    error = "Error: Unauthorized";
  } else if (user.status === "blocked") {
    error = "Error: User blocked";
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
