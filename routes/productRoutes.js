const express = require("express");
const productRouter = express.Router();
const productController = require("../controllers/productController");
const { upload } = require("../helper/helper");
const roleBasedAuth = require("../middlewares/roleBasedAuth");
const auth = require("../middlewares/auth");

productRouter.get("/", productController.getProducts);
productRouter.get("/:id", productController.getProductById);
productRouter.use(roleBasedAuth(["admin", "seller"]));
productRouter.post(
  "/",
  upload.fields([{ name: "images" }]),
  productController.createProduct
);
productRouter.put(
  "/:id",
  upload.fields([{ name: "images" }]),
  productController.updateProduct
);
productRouter.delete("/:id", productController.deleteProduct);

module.exports = productRouter;
