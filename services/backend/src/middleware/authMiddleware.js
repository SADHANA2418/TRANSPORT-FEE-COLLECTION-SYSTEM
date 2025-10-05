import jwt from "jsonwebtoken";

// Authentication middleware to protect routes
export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  // Expecting header format: "Bearer <token>"
  const token = authHeader && authHeader.split(' ')[1];

  if (!token)
    return res.status(401).json({ error: "Access denied. No token provided." });

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err)
      return res.status(403).json({ error: "Invalid or expired token." });

    // Attach user info from token payload to request object
    req.user = {
      user_id: user.user_id,
      email: user.email,
      role: user.role,
      name: user.name,
    };

    next(); // Proceed to the next middleware or route handler
  });
};
