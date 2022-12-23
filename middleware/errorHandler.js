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
  console.log(err.stack);

  const status = res.statusCode ? res.statusCode : 500; // server err

  res.status(status).json({ message: err.message });
};

module.exports = errorHandler;
