const express = require("express");
const cartRouter = express.Router();
const cartController = require("../controllers/cartController");
const auth = require("../middlewares/auth");


cartRouter.get("/", cartController.getCart);
cartRouter.post("/", cartController.addToCart);
cartRouter.put("/", cartController.updateCart);
cartRouter.delete("/:productId", cartController.removeFromCart);
cartRouter.delete("/", cartController.clearCart);

module.exports = cartRouter;
