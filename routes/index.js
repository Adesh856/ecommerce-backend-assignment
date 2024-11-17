const express = require("express");
const auth = require("../middlewares/auth");
const router = express.Router();

router.use("/auth", require("./authRoutes"));
router.use(auth);
router.use("/users", require("./userRoutes"));
router.use("/products", require("./productRoutes"));
router.use("/cart", require("./cartRoutes"));
router.use("/orders", require("./orderRoutes"));

module.exports = router;
