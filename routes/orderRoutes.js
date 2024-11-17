const express = require("express");
const orderRouter = express.Router();
const orderController = require("../controllers/orderController");
const roleBasedAuth = require("../middlewares/roleBasedAuth");
const auth = require("../middlewares/auth");

orderRouter.post("/:cartId", orderController.createOrder);
orderRouter.get("/", orderController.getOrders);
orderRouter.get("/:id", orderController.getOrderById);
orderRouter.put("/:id", roleBasedAuth(["admin"]), orderController.updateOrder);
orderRouter.delete(
  "/:id",
  roleBasedAuth(["admin"]),
  orderController.deleteOrder
);

module.exports = orderRouter;
