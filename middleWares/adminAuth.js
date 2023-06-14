import jwt from "jsonwebtoken";

export const adminVerification = (req, res, next) => {
  try {
    const adminAuthHeader = req.header("Authorization");

    if (!adminAuthHeader)
      return res.status(403).json({ error: "Access Denied" });

    const adminToken = adminAuthHeader.split(" ").pop();
    jwt.verify(adminToken, process.env.ADMIN_JWT_SECRET, (err, decoded) => {
      if (err) {
        return res.status(500).json({ error: "Authentication failed" });
      }
      req.decoded = decoded;
      next();
    });
  } catch (err) {
    res.status(500).json({ error: err });
  }
};
