const multer = require("multer");
const s3Service = require("./aws/s3Service");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const config = require("../config/config");
const storage = multer.memoryStorage();
const upload = multer({ storage });

async function uploadProductImages(images) {
  if (!images || !images.length) return [];

  const imageUrls = await Promise.all(
    images.map((image) => s3Service.uploadImage(image))
  );

  return imageUrls.map((url) => ({
    url,
    productId: product._id,
  }));
}

function compareHashPassword(plainPassword, hashedPassword) {
  return bcrypt.compare(plainPassword, hashedPassword);
}

function hashPassword(plainPassword, saltRounds = 10) {
  return bcrypt.hash(plainPassword, saltRounds);
}

function generateToken(user) {
  const payload = { id: user._id, role: user.role };
  const secretKey = config.JWT_SECRET;
  const options = { expiresIn: config.JWT_EXPIRY };

  return jwt.sign(payload, secretKey, options);
}

module.exports = {
  upload,
  compareHashPassword,
  hashPassword,
  uploadProductImages,
  generateToken,
};
