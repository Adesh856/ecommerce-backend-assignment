const express = require("express");
const userRouter = express.Router();
const userController = require("../controllers/userController");
const roleBasedAuth = require("../middlewares/roleBasedAuth");
const auth = require("../middlewares/auth");

userRouter.use(roleBasedAuth(["admin"]));

userRouter.get("/", userController.getUsers);
userRouter.get("/:id", userController.getUserById);
userRouter.put("/:id", userController.updateUser);
userRouter.delete("/:id", userController.deleteUser);

module.exports = userRouter;
