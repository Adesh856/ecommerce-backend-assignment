const express = require("express");
const connectDB = require("./config/db");
const routes = require("./routes/index");
const config = require("./config/config");
const logger = require("./helper/logger");

const app = express();
connectDB();

app.use(express.json());
app.use("/api", routes);

app.listen(config.PORT, () =>
  logger.info(`Server running on port http://localhost:${config.PORT}`)
);
