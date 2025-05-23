const jwt = require("jsonwebtoken");

const userMiddleware = (req, res, next) => {
  const token = req.headers.token;
  if (!token) {
    return res.json({ message: "You are not signed in please signin" });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_PASSWORD);
    req.userId = decoded.userId;
    next();
  } catch (err) {
    res.json({ message: "Invalid or expired token" });
  }
};

module.exports = { userMiddleware };
