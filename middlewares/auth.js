const jwt = require("jsonwebtoken");
const User = require("../models/user");
const mongoose = require("mongoose");
const config = require("../config/config");
const auth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    console.log({ authHeader });
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res
        .status(401)
        .json({ message: "Unauthorized. No token provided." });
    }
    const token = authHeader.split(" ")[1];
    const secretKey = config.JWT_SECRET;

    const decoded = jwt.verify(token, secretKey);

    const user = await User.findById(decoded.id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    req.user = user;
    req.userId = user._id;
    next();
  } catch (error) {
    return res.status(401).json({
      message: "Unauthorized. Invalid token.",
      error: error.message,
    });
  }
};

module.exports = auth;
