const dayjs = require("dayjs");
const { v4: uuid } = require("uuid");
const fs = require("fs");
const fsPromise = require("fs").promises;
const path = require("path");

const logEvents = async (message, fileName) => {
  const date = dayjs(new Date()).format("DD/MM/YYYY\tHH:mm:ss");
  const log = `${date}\t${uuid()}\t${message}\n`;

  try {
    if (!fs.existsSync(path.join(__dirname, "../logs"))) {
      await fsPromise.mkdir(path.join(__dirname, "../logs"));
    }
    await fsPromise.appendFile(path.join(__dirname, "../logs", fileName), log);
  } catch (error) {
    console.log(error.message);
  }
};

const logger = (req, res, next) => {
  if (req.method === "POST" && req.url === "/api/task") {
    logEvents(
      `${req.method}\t${req.url}\t${req.headers.origin}`,
      "RequestLogs.log"
    );
    console.log(`${req.method}\t${req.path}`);
  }

  next();
};

module.exports = { logEvents, logger };
