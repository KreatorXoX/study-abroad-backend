const rateLimit = require("express-rate-limit");
const { logEvents } = require("./logger");

const loginLimiter = rateLimit({
  windowMs: 60 * 1000, // 60 seconds
  max: 5, // limiting each ip to 5 tries
  message: {
    message: "Too many login attemps from this IP, try again 60 seconds later.",
  },
  handler: (req, res, next, options) => {
    logEvents(
      `Too many requests : ${options.message.message}\t${req.method}\t${req.url}\t${req.headers.origin}`,
      "ErrorLogs.log"
    );
    res.status(options.statusCode).send(options.message);
  },
  standardHeaders: true, // recommended from the docs
  legacyHeaders: false, // recommended from the docs
});

module.exports = loginLimiter;
