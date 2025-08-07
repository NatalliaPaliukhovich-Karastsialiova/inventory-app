import prisma from "../config/db.js";
import { hashPassword, comparePassword, generateToken } from "../utils/cryptoUtils.js";
import passport from 'passport';

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

    res.json({ token: generateToken(currentUser), user: { id: currentUser.id, email } });
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
    if(!user.password && password)
      return res.status(401).json({ error: "User wasn't registered by Email and Password." });
    if (!(await comparePassword(password, user.password)))
      return res.status(401).json({ error: "Invalid email or password." });
    return res.json({ token: generateToken(user), user: { id: user.id, email, avatar: user.avatar, fullName: user.fullName } });
  } catch (err) {
    return res.status(500).json({ error: `Error generating token., ${err.message}`});
  }
};

export const socialCallbackController = (req, res) => {
  const user = req.user;

  if (!user) {
    return res.status(401).send('Unauthorized')
  }

  user.token = generateToken(user)

  res.send(`
    <script>
      window.opener.postMessage(${JSON.stringify(user)}, '*');
      window.close();
    </script>
  `)
}
