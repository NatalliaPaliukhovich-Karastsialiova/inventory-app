import jwt from "jsonwebtoken";
const JWT_SECRET = process.env.JWT_SECRET;

export function auth(requiredRole = "USER") {
  return (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      if (requiredRole === "GUEST") return next();
      return res.status(401).json({ error: "Authorization is required." });
    }

    const token = authHeader.split(" ")[1];

    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      req.user = decoded;

      const rolesPriority = { GUEST: 0, USER: 1, ADMIN: 2 };
      if (rolesPriority[decoded.role] < rolesPriority[requiredRole]) {
        return res.status(403).json({ error: "Access forbidden." });
      }

      next();
    } catch (err) {
      res.status(401).json({ error: "Invalid token." });
    }
  };
}

export const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await prisma.user.findUnique({ where: { id: decoded.id } });
    if (!user) return res.status(401).json({ message: 'Unauthorized' });

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
};
