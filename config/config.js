require("dotenv").config();

const config = {
  MONGO_URI: process.env.MONGO_URI || "",
  PORT: process.env.PORT || 3000,
  NODE_ENV: process.env.NODE_ENV || "DEV",
  AWS_ACCESS_KEY: process.env.AWS_ACCESS_KEY,
  AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY,
  IMAGE_BUCKET_NAME: process.env.IMAGE_BUCKET_NAME,
  AWS_REGION: process.env.AWS_REGION,
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_EXPIRY: process.env.JWT_EXPIRY,
};

module.exports = config;
