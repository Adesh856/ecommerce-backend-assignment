const { default: mongoose } = require("mongoose");
const logger = require("../helper/logger");
const Order = require("../models/order");
const { Cart } = require("../models/cart");

class OrderController {
  async createOrder(req, res) {
    const { cartId } = req.params;
    try {
      const cart = await Cart.findById(cartId);
      if (!cart) {
        logger.warn("Cart not found", { id: cartId });
        return res.status(404).json({ message: "Cart not found" });
      }
      const totalAmount = cart.totalPrice;
      const order = new Order({
        ...req.body,
        userId: req.userId,
        cartId,
        totalAmount,
      });
      await order.save();

      return res.status(201).json({
        message: "Order created successfully",
        order,
      });
    } catch (error) {
      logger.error("Failed to create order", { error: error.message });
      return res.status(400).json({
        message: "Failed to create order",
        error: error.message,
      });
    }
  }

  async getOrders(req, res) {
    try {
      const orders = await Order.find({ userId: req.userId });

      return res.status(200).json({
        message: "Orders retrieved successfully",
        orders,
      });
    } catch (error) {
      logger.error("Failed to retrieve orders", { error: error.message });
      return res.status(500).json({
        message: "Failed to retrieve orders",
        error: error.message,
      });
    }
  }

  async getOrderById(req, res) {
    try {
      const order = await Order.findOne({
        userId: req.userId,
        order: mongoose.Types.ObjectId(req.params.id),
      });
      if (!order) {
        logger.warn("Order not found", { id: req.params.id });
        return res.status(404).json({ message: "Order not found" });
      }
      return res.status(200).json({
        message: "Order retrieved successfully",
        order,
      });
    } catch (error) {
      logger.error("Failed to retrieve order", { error: error.message });
      return res.status(500).json({
        message: "Failed to retrieve order",
        error: error.message,
      });
    }
  }

  async updateOrder(req, res) {
    try {
      const isOrderExists = Order.findOne({
        userId: req.userId,
        _id: mongoose.Types.ObjectId(req.params.id),
      });
      if (!isOrderExists) {
        logger.warn("Order not found for update", { id: req.params.id });
        return res.status(404).json({ message: "Order not found" });
      }
      const order = await Order.findByIdAndUpdate(
        mongoose.Types.ObjectId(req.params.id),
        req.body,
        {
          new: true,
          runValidators: true,
        }
      );

      return res.status(200).json({
        message: "Order updated successfully",
        order,
      });
    } catch (error) {
      logger.error("Failed to update order", { error: error.message });
      return res.status(400).json({
        message: "Failed to update order",
        error: error.message,
      });
    }
  }

  async deleteOrder(req, res) {
    try {
      const isOrderExists = Order.findOne({
        userId: req.userId,
        _id: mongoose.Types.ObjectId(req.params.id),
      });
      if (!isOrderExists) {
        logger.warn("Order not found for delete", { id: req.params.id });
        return res.status(404).json({ message: "Order not found" });
      }

      const order = await Order.findByIdAndDelete(
        mongoose.Types.ObjectId(req.params.id)
      );
      if (!order) {
        logger.warn("Order not found for deletion", { id: req.params.id });
        return res.status(404).json({ message: "Order not found" });
      }
      logger.info("Order deleted successfully", { id: req.params.id });
      return res.status(200).json({ message: "Order deleted successfully" });
    } catch (error) {
      logger.error("Failed to delete order", { error: error.message });
      return res.status(500).json({
        message: "Failed to delete order",
        error: error.message,
      });
    }
  }
}

module.exports = new OrderController();
