import jwt from "jsonwebtoken";

export const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.header("Authorization");

    if (!authHeader) {
      return res.status(403).json({ error: "Access Denied" });
    }

    const token = authHeader.split(" ").pop();

    jwt.verify(token, process.env.DOC_JWT_SECRET, (err, decoded) => {
      if (err) {
        return res.status(200).json({ message: "Authentication failed" });
      }
      req.decoded = decoded;
      next();
    });
  } catch (err) {
    res.status(500).json({ error: err });
  }
};
