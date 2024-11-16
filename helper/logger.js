const { createLogger, format, transports } = require("winston");
const config = require("../config/config");
require("winston-mongodb");

const logger = createLogger({
  level: "info",
  format: format.combine(format.errors({ stack: true }), format.json()),
  transports: [
    new transports.Console({
      format: format.combine(format.colorize(), format.simple()),
    }),

    new transports.MongoDB({
      db: config.MONGO_URI,
      options: { useUnifiedTopology: true },
      collection: "logs",
      level: ["error", "warn"],
    }),
  ],
});

module.exports = logger;
