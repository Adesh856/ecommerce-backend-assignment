const roleBasedAuth = (allowedRoles) => async (req, res, next) => {
  try {
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: "Access denied" });
    }
    next();
  } catch (error) {
    return res.status(401).json({
      message: "Unauthorized. Invalid token.",
      error: error.message,
    });
  }
};

module.exports = roleBasedAuth;
