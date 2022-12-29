const jwt = require("jsonwebtoken");

const verifyAdmin = (req, res, next) => {
  const authHeader = req.headers.authorization || req.headers.Authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const token = authHeader.split(" ")[1];

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
    if (err) return res.status(403).json({ message: "Forbidden" });
    if (decoded.userInfo.role !== "admin") {
      return res.status(403).json({ message: "You need to loggin as Admin!" });
    }
    req._id = decoded.UserInfo._id;
    req.email = decoded.UserInfo.email;
    req.user = decoded.UserInfo.username;
    req.role = decoded.UserInfo.role;
    next();
  });
};

module.exports = verifyAdmin;
