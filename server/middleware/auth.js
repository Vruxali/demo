// auth.js
const jwt = require("jsonwebtoken");
const User = require("../models/user.model");

exports.verifyToken = async (req, res, next) => {
  try {
    const header = req.headers.authorization;
    if (!header || !header.startsWith("Bearer "))
      return res.status(401).json({ message: "No token provided" });

    const token = header.split(" ")[1];

    // Use the same fallback secret as login
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "secretkey");

    const user = await User.findById(decoded.id).select(
      "_id email role fullName city donorDetails"
    );
    if (!user) return res.status(401).json({ message: "User not found" });

    req.user = {
      id: user._id,
      email: user.email,
      role: user.role,
      name: user.fullName,
      city: user.city || user?.donorDetails?.city || "",
    };
    next();
  } catch (err) {
    console.error("Auth error:", err);
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};
