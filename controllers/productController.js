const Product = require("../models/product");
const logger = require("../helper/logger");
const ProductImages = require("../models/productImage");
const s3Service = require("../helper/aws/s3Service");
const { uploadProductImages } = require("../helper/helper");
const mongoose = require("mongoose");

class ProductController {
  async createProduct(req, res) {
    const { body: payload, files, userId } = req;

    const uploadedImages = files?.images;

    try {
      const product = new Product({
        ...payload,
        userId,
      });
      await product.save();

      const productImages = await uploadProductImages(uploadedImages);
      if (productImages.length) {
        await ProductImages.insertMany(productImages);
      }

      return res.status(201).json({
        message: "Product created successfully",
        product,
      });
    } catch (error) {
      logger.error("Failed to create product", { error: error.message });

      return res.status(500).json({
        message: "Failed to create product",
        error: error.message,
      });
    }
  }

  async getProducts(req, res) {
    try {
      const { search, priceMin, priceMax, stockMin, stockMax } = req.query;
      const { userId } = req;
      let filter = { userId };

      if (search) {
        filter.name = { $regex: search, $options: "i" };
      }

      if (priceMin) {
        filter.price = { ...filter.price, $gte: priceMin };
      }
      if (priceMax) {
        filter.price = { ...filter.price, $lte: priceMax };
      }

      if (stockMin) {
        filter.stock = { ...filter.stock, $gte: stockMin };
      }
      if (stockMax) {
        filter.stock = { ...filter.stock, $lte: stockMax };
      }
      const products = await Product.aggregate([
        { $match: filter },
        {
          $lookup: {
            from: "productimages",
            localField: "_id",
            foreignField: "productId",
            as: "images",
          },
        },
      ]);

      return res.status(200).json({
        message: "Products retrieved successfully",
        products,
      });
    } catch (error) {
      logger.error("Failed to retrieve products", { error: error.message });
      return res.status(500).json({
        message: "Failed to retrieve products",
        error: error.message,
      });
    }
  }

  async getProductById(req, res) {
    const { userId } = req;
    try {
      const product = await Product.aggregate([
        {
          $match: {
            _id: mongoose.Types.ObjectId(req.params.id),
            userId,
          },
        },
        {
          $lookup: {
            from: "productimages",
            localField: "_id",
            foreignField: "productId",
            as: "images",
          },
        },
      ]);
      if (!product) {
        logger.warn("Product not found", { id: req.params.id });
        return res.status(404).json({ message: "Product not found" });
      }
      return res.status(200).json({
        message: "Product retrieved successfully",
        product,
      });
    } catch (error) {
      logger.error("Failed to retrieve product", { error: error.message });
      return res.status(500).json({
        message: "Failed to retrieve product",
        error: error.message,
      });
    }
  }

  async updateProduct(req, res) {
    const productId = req.params.id;
    const {
      body: { deleteProductImageIds, ...payload },
      files: { images },
      userId,
    } = req;
    try {
      const product = await Product.findOne({
        _id: productId,
        userId,
      });

      if (!product) {
        logger.warn("Product not found or unauthorized for update", {
          id: productId,
        });
        return res
          .status(404)
          .json({ message: "Product not found or unauthorized" });
      }

      await product.updateOne(payload, {
        new: true,
        runValidators: true,
      });

      if (deleteProductImageIds?.length) {
        const imagesToDelete = await ProductImages.find({
          _id: { $in: deleteProductImageIds },
          productId,
        });

        const imageUrls = imagesToDelete.map((img) => img.url);
        await s3Service.deleteImages(imageUrls);
        await ProductImages.deleteMany({ _id: { $in: deleteProductImageIds } });
      }

      if (images?.length) {
        const uploadedImages = await uploadProductImages(images);

        const productImages = uploadedImages.map((url) => ({
          url,
          productId,
        }));

        await ProductImages.insertMany(productImages);
      }

      return res.status(200).json({
        message: "Product updated successfully",
        product,
      });
    } catch (error) {
      logger.error("Failed to update product", { error: error.message });
      return res.status(400).json({
        message: "Failed to update product",
        error: error.message,
      });
    }
  }

  async deleteProduct(req, res) {
    const { userId, params } = req;
    try {
      const product = await Product.findOneAndDelete({
        _id: req.params.id,
        userId,
      });
      if (!product) {
        logger.warn("Product not found for deletion", { id: params.id });
        return res.status(404).json({ message: "Product not found" });
      }
      return res.status(200).json({ message: "Product deleted successfully" });
    } catch (error) {
      logger.error("Failed to delete product", { error: error.message });
      return res.status(500).json({
        message: "Failed to delete product",
        error: error.message,
      });
    }
  }
}

module.exports = new ProductController();
