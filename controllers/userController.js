const User = require("../models/user");
const logger = require("../helper/logger");

class UserController {
  async getUsers(req, res) {
    console.log("inside");
    try {
      const { search, role } = req.query;

      let filter = {};

      if (search) {
        filter.name = { $regex: search, $options: "i" };
      }

      if (role) {
        filter.role = role;
      }

      const users = await User.find(filter);

      return res.status(200).json({
        message: "Users retrieved successfully",
        users,
      });
    } catch (error) {
      logger.error("Failed to retrieve users", { error: error.message });

      return res.status(500).json({
        message: "Failed to retrieve users",
        error: error.message,
      });
    }
  }

  async getUserById(req, res) {
    try {
      const userId = req.params.id;

      const user = await User.findById(userId);
      if (!user) {
        logger.warn("User not found", { id: userId });
        return res.status(404).json({ message: "User not found" });
      }

      return res.status(200).json({
        message: "User retrieved successfully",
        user,
      });
    } catch (error) {
      logger.error("Failed to retrieve user", { error: error.message });

      return res.status(500).json({
        message: "Failed to retrieve user",
        error: error.message,
      });
    }
  }

  async updateUser(req, res) {
    const userId = req.params.id;
    const { body: payload } = req;

    try {
      const user = await User.findByIdAndUpdate(userId, payload, {
        new: true,
        runValidators: true,
      });

      if (!user) {
        logger.warn("User not found for update", { id: userId });
        return res.status(404).json({ message: "User not found" });
      }

      return res.status(200).json({
        message: "User updated successfully",
        user,
      });
    } catch (error) {
      logger.error("Failed to update user", { error: error.message });

      return res.status(400).json({
        message: "Failed to update user",
        error: error.message,
      });
    }
  }

  async deleteUser(req, res) {
    try {
      const userId = req.params.id;

      const user = await User.findByIdAndDelete(userId);
      if (!user) {
        logger.warn("User not found for deletion", { id: userId });
        return res.status(404).json({ message: "User not found" });
      }

      return res.status(200).json({ message: "User deleted successfully" });
    } catch (error) {
      logger.error("Failed to delete user", { error: error.message });

      return res.status(500).json({
        message: "Failed to delete user",
        error: error.message,
      });
    }
  }
}

module.exports = new UserController();
