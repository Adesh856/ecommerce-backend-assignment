const {
  hashPassword,
  compareHashPassword,
  generateToken,
} = require("../helper/helper");
const logger = require("../helper/logger");
const User = require("../models/user");

class AuthController {
  async register(req, res) {
    const { email, password, name, role } = req.body;
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

    try {
      if (!passwordRegex.test(password)) {
        return res.status(400).json({
          message: "Validation failed",
          errors: [
            "Password must include at least one uppercase letter, one lowercase letter, one number, and one special character",
          ],
        });
      }
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(409).json({ message: "User already exists." });
      }

      const hashedPassword = await hashPassword(password);

      const newUser = new User({
        email,
        password: hashedPassword,
        name,
        role,
      });

      await newUser.save();

      const token = generateToken(newUser);

      return res.status(201).json({
        message: "User registered successfully",
        token,
      });
    } catch (error) {
      if (error.name === "ValidationError") {
        const errors = Object.values(error.errors).map((err) => err.message);
        return res.status(400).json({ message: "Validation failed", errors });
      }

      logger.error("Registration failed", { error: error.message });
      return res
        .status(500)
        .json({ message: "Registration failed", error: error.message });
    }
  }
  async login(req, res) {
    const { email, password } = req.body;

    try {
      const user = await User.findOne({ email });

      if (!user || !(await compareHashPassword(password, user.password))) {
        return res.status(401).json({ message: "Invalid email or password." });
      }

      const token = generateToken(user);

      return res.status(200).json({
        message: "Login successful",
        token,
      });
    } catch (error) {
      logger.error("Login failed", { error: error.message });
      return res
        .status(500)
        .json({ message: "Login failed", error: error.message });
    }
  }
}

module.exports = new AuthController();
