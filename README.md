# E-commerce Backend

This repository contains the backend for an e-commerce platform. It is built using **Node.js**, **Express.js**, **AWS S3 Services**, and **MongoDB**. This backend provides APIs for managing products, users, authentication, and more.

---

## Tech Stack

- **Node.js**: JavaScript runtime for building scalable server-side applications.
- **Express.js**: Web framework for creating RESTful APIs.
- **MongoDB**: NoSQL database for storing data.
- **AWS S3**: Cloud storage service for handling image uploads and storage.

---

## Prerequisites

Ensure you have the following installed before running the project:

1. **Node.js** (version 18 or later)
2. **MongoDB** (local or cloud instance)
3. **AWS Account** (for S3 storage)

---

## Environment Variables

Copy `.env.example` and create `.env` file in the project root and add the following environment variables:

```env
# Application Environment
NODE_ENV=DEV
PORT=5000

# MongoDB Configuration
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/ecommerceDB?retryWrites=true&w=majority&appName=Cluster0

# JWT Configuration
JWT_SECRET=your_jwt_secret_here
JWT_EXPIRY=5d

# AWS S3 Credentials
AWS_SECRET_ACCESS_KEY=your_aws_secret_access_key_here
AWS_ACCESS_KEY=your_aws_access_key_here
IMAGE_BUCKET_NAME=your_s3_bucket_name_here
AWS_REGION=your_aws_region_here
```

Replace `<username>` and `<password>` in the `MONGO_URI` with your actual MongoDB credentials. Replace the placeholders in other fields with your specific values.

---

## Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/Adesh856/ecommerce-backend-assignment
   cd ecommerce-backend-assignment
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Set up the `.env` file as mentioned above.

---

## Running the Application

1. Start the server in development mode:

   ```bash
   npm run dev
   ```

2. The server will run on `http://localhost:5000` by default (or the port specified in the `.env` file).

---

Here’s the updated **Features** section for your README, incorporating the provided details about authentication, user roles, and other functionality:

---

## Features

### 1. **Authentication**

- Secure register and login for users.
- Token-based authentication using JWT for secure communication.
- Password encryption for enhanced security.

### 2. **User Management**

- Role-based access control:
  - **User**: Browse products, manage cart, place orders.
  - **Seller**: Add, update, and manage products.
  - **Admin**: Manage users, orders, and products.
- Update user profiles and view order history.

### 3. **Product Management**

- APIs for sellers to:
  - Add new products.
  - Update product details.
  - Delete products.
- Products are categorized and can be searched or filtered by criteria.

### 4. **Cart Management**

- Add products to the cart.
- Update product quantities in the cart.
- Remove products from the cart.
- View cart details, including total price and item breakdown.

### 5. **Order Management**

- Place orders directly from the cart.
- Admin can manage and update order statuses.

### 6. **Role-Based Management**

- **User**: Limited access to view products, manage their own cart, and place orders.
- **Seller**: Access to manage their own products and view related orders.
- **Admin**: Complete control over the platform, including user management, product approvals, and order tracking.

### 7. **Image Upload**

- Upload product images using AWS S3.
- Efficient image handling and secure storage.

---

## Folder Structure

```
.
├── controllers       # API logic for various resources
├── middlewares       # Middleware functions
├── models            # Mongoose schemas for MongoDB collections
├── routes            # API route definitions
├── services          # AWS S3 and other service integrations
├── utils             # Utility functions
├── .env.example      # Example of environment variables
├── server.js         # Entry point of the application
└── package.json      # Project metadata and dependencies
```

---

## Notes

- Replace sensitive credentials in `.env` with your own.
- Do not commit the `.env` file to version control to keep your credentials secure.
- Ensure your MongoDB URI and AWS S3 credentials are correct for successful integration.

---
