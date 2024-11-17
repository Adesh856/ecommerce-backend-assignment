const { Cart, CartItem } = require("../models/cart");
const Product = require("../models/product");
const logger = require("../helper/logger");
const { default: mongoose } = require("mongoose");

class CartController {
  async getCart(req, res) {
    const { userId } = req;

    try {
      let cart = await Cart.findOne({ userId }).populate({
        path: "items",
        populate: {
          path: "productId",
          model: "Product",
        },
      });

      if (!cart) {
        return res.status(200).json({
          message: "Cart retrieved successfully",
          cart: [],
        });
      }
      return res.status(200).json({
        message: "Cart retrieved successfully",
        cart,
      });
    } catch (error) {
      logger.error("Failed to retrieve cart", { error: error.message });
      return res.status(500).json({
        message: "Failed to retrieve cart",
        error: error.message,
      });
    }
  }

  async addToCart(req, res) {
    const { userId } = req;
    const { productId, quantity } = req.body;

    try {
      const isOwnProduct = await Product.findOne({ _id: productId, userId });
      if (isOwnProduct) {
        return res
          .status(400)
          .json({ message: "You cannot add your own product" });
      }
      const product = await Product.findById(productId);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }

      let cart = await Cart.findOne({ userId });

      if (!cart) {
        cart = new Cart({ userId, items: [], totalPrice: 0 });
      }

      const isInCart = await CartItem.findOne({
        productId: new mongoose.Types.ObjectId(productId),
        userId,
      });
      if (isInCart) {
        return res
          .status(400)
          .json({ message: "Product is already in the cart" });
      }
      const itemPrice = product.price * quantity;
      const cartItem = new CartItem({
        productId,
        quantity,
        userId,
        price: itemPrice,
      });
      await cartItem.save();
      cart.items.push(cartItem._id);

      cart.totalPrice = itemPrice + cart.totalPrice;

      await cart.save();

      return res.status(200).json({
        message: "Product added to cart successfully",
        cart,
      });
    } catch (error) {
      logger.error("Failed to add product to cart", { error: error.message });
      return res.status(500).json({
        message: "Failed to add product to cart",
        error: error.message,
      });
    }
  }

  async updateCart(req, res) {
    const { userId } = req;
    const { productId, quantity } = req.body;

    try {
      let cart = await Cart.findOne({ userId });
      const product = await Product.findById(productId);

      if (!cart) {
        return res.status(404).json({ message: "Cart not found" });
      }

      const cartItem = await CartItem.findOne({
        productId: new mongoose.Types.ObjectId(productId),
        userId,
      });

      if (!cartItem) {
        return res.status(404).json({ message: "Cart item not found" });
      }

      const prevItemPrice = cartItem.price;
      cartItem.quantity = quantity;
      cartItem.price = quantity * product.price;
      await cartItem.save();

      const priceDifference = Math.abs(cartItem.price - prevItemPrice);
      cart.totalPrice +=
        cartItem.price > prevItemPrice ? priceDifference : -priceDifference;
      await cart.save();

      return res.status(200).json({
        message: "Cart updated successfully",
        cart,
      });
    } catch (error) {
      logger.error("Failed to update cart", { error: error.message });
      return res.status(500).json({
        message: "Failed to update cart",
        error: error.message,
      });
    }
  }

  async removeFromCart(req, res) {
    const { userId } = req;
    const { productId } = req.params;

    try {
      let cart = await Cart.findOne({ userId });

      if (!cart) {
        return res.status(404).json({ message: "Cart not found" });
      }
      const cartItem = await CartItem.findOne({ productId, userId });

      if (!cartItem) {
        return res.status(404).json({ message: "Cart item not found" });
      }

      cart.totalPrice -= cartItem.price;
      cart.items = cart.items.filter((item) => item !== cartItem._id);

      await cart.save();

      await CartItem.findByIdAndDelete(cartItem._id);
      let message = "Product removed from cart successfully";
      if (cart.items.length === 1) {
        await Cart.findByIdAndDelete(cart._id);
        message =
          "Product removed from cart and Cart is empty. Please add product to cart";
      }
      return res.status(200).json({
        message: message,
      });
    } catch (error) {
      logger.error("Failed to remove product from cart", {
        error: error.message,
      });
      return res.status(500).json({
        message: "Failed to remove product from cart",
        error: error.message,
      });
    }
  }

  async clearCart(req, res) {
    const { userId } = req;

    try {
      const cart = await Cart.findOne({ userId });
      if (!cart) {
        return res.status(404).json({ message: "Cart not found" });
      }

      await CartItem.deleteMany({ _id: { $in: cart.items } });

      await Cart.findByIdAndDelete(cart._id);

      return res.status(200).json({
        message: "Cart cleared successfully",
      });
    } catch (error) {
      logger.error("Failed to clear cart", { error: error.message });
      return res.status(500).json({
        message: "Failed to clear cart",
        error: error.message,
      });
    }
  }
}

module.exports = new CartController();
