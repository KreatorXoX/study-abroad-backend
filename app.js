require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
const cookieParser = require("cookie-parser");

const connectDB = require("./config/dbConnection");
const corsOpts = require("./config/corsOptions");
const { logger } = require("./middleware/logger");
const errorHandler = require("./middleware/errorHandler");
const { logEvents } = require("./middleware/logger");

const PORT = process.env.PORT || 5000;

connectDB();

const app = express();

// middlewares
app.use(logger);

app.use(cors(corsOpts));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(cookieParser());

// for serving the static files
app.use("/", express.static(path.join(__dirname, "public")));

// routes
app.use("/", require("./routes/root"));

app.use("/api/users", require("./routes/userRoutes"));

app.use("/api/applications", require("./routes/applicationRoutes"));

app.use("/api/tasks", require("./routes/taskRoutes"));

app.use("/api/countries", require("./routes/countryRoutes"));

app.use("/api/universities", require("./routes/universityRoutes"));

// for unknown routes
app.all("*", (req, res) => {
  res.status(404);
  if (req.accepts("html")) {
    res.sendFile(path.join(__dirname, "views/404.html"));
  } else if (req.accepts("json")) {
    res.json({ message: "404 not found" });
  } else {
    res.type("txt").send("404 not found");
  }
});

// error handling
app.use(errorHandler);

// mongo connection check and log errors if any
mongoose.connection.once("open", () => {
  console.log("open connection to server");
  app.listen(PORT, () => {
    console.log(`listening on ${PORT}`);
  });
});

mongoose.connection.on("err", (err) => {
  console.error(err);
  logEvents(
    `${err.no}: ${err.code}\t${err.syscall}\t${err.hostname}`,
    "mongoErrors.log"
  );
});
