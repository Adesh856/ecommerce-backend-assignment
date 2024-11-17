const logger = require("../helper/logger");
const ProductImages = require("../models/productImage");
const s3Service = require("../services/aws/s3Service");
const { uploadProductImages } = require("../helper/helper");
const mongoose = require("mongoose");
const Product = require("../models/product");
class ProductController {
  async createProduct(req, res) {
    const { body: payload, files, userId } = req;

    const uploadedImages = files?.images;
    let productId = null;
    try {
      const product = new Product({
        ...payload,
        userId,
      });
      await product.save();
      productId = product._id;
      const productImages = await uploadProductImages(
        uploadedImages,
        product,
        userId
      );
      if (productImages.length) {
        await ProductImages.insertMany(productImages);
      }
      const images = productImages.map((image) => image.url);
      return res.status(201).json({
        message: "Product created successfully",
        product: { ...product.toObject(), images },
      });
    } catch (error) {
      if (productId) await Product.findByIdAndDelete(productId);
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
            _id: new mongoose.Types.ObjectId(req.params.id),
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
    let {
      body: { deleteProductImageIds, ...payload },
      files: { images },
      userId,
    } = req;
    try {
      deleteProductImageIds = Array.isArray(deleteProductImageIds)
        ? deleteProductImageIds.map((id) => new mongoose.Types.ObjectId(id))
        : [new mongoose.Types.ObjectId(deleteProductImageIds)];

      const product = await Product.findOne({
        _id: new mongoose.Types.ObjectId(productId),
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

      if (deleteProductImageIds?.length) {
        const imagesToDelete = await ProductImages.find({
          _id: { $in: deleteProductImageIds },
          productId,
        });

        const imageUrls = imagesToDelete.map((img) => img.url);
        await s3Service.deleteImages(imageUrls);
        const imagedelete = await ProductImages.deleteMany({
          _id: { $in: deleteProductImageIds },
        });
      }

      if (images?.length) {
        const uploadedImages = await uploadProductImages(
          images,
          product,
          userId
        );
        await ProductImages.insertMany(uploadedImages);
      }
      const userUpdatedImages = (await ProductImages.find({ productId })).map(
        (image) => image._id
      );
      const updatedProduct = await product.updateOne(
        { ...payload, images: userUpdatedImages },
        {
          new: true,
          runValidators: true,
        }
      );

      return res.status(200).json({
        message: "Product updated successfully",
        updatedProduct,
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
      const getProductImageIds = await ProductImages.find({
        productId: product._id,
        userId,
      });
      if (getProductImageIds.length) {
        const imageUrls = getProductImageIds.map((img) => img.url);
        await s3Service.deleteImages(imageUrls);
        await ProductImages.deleteMany({ productId: product._id });
      }

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
