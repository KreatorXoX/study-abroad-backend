const { logEvents } = require("./logger");
const { cloudinary } = require("../config/cloudinaryOptions");
const errorHandler = (err, req, res, next) => {
  if (req.file) {
    //if there is an error in the routes and if there is a req.file attr.
    cloudinary.uploader.destroy(req.file.filename);
  }
  logEvents(
    `${err.name}: ${err.message}\t${req.method}\t${req.url}\t${req.headers.origin}`,
    "ErrorLogs.log"
  );

  if (res.headersSent) {
    return next(err);
  }

  res.status(err.code || 500);
  res.json({ message: err.message || "An unknown error occurred!" });
};

module.exports = errorHandler;
