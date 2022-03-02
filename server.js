const mongoose = require("mongoose");
const dotenv = require("dotenv");

// handle uncaught exception
process.on("uncaughtException", (err) => {
  console.log("UNCAUGHT EXCEPTION! Shutting down");
  console.log(err);
  console.log(err.name, err.message);
  process.exit(1);
});

dotenv.config({ path: "./config.env" });

const app = require("./app");

const httpServer = require("http").createServer(app);
let io = require("socket.io")(httpServer, {
  cors: {
    origin: ["*"],
    handlePreflightRequest: (req, res) => {
      res.writeHead(200, {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET,POST",
        "Access-Control-Allow-Headers": "my-custom-header",
        "Access-Control-Allow-Credentials": true,
      });
      res.end();
    },
  },
});

require("./socket")(io);

// DATABASE CONFIGURATION OPTION {USERNAME, PASSWORD, DBNAME}
const DB_USER = process.env.DATABASE_USER;
const DB_PASSWORD = process.env.DATABASE_PASSWORD;
const DB_NAME = process.env.DATABASE_NAME;

// BUILD THE CONNECTION STRING
let DB = process.env.DATABASE.replace("<user>", DB_USER);
DB = DB.replace("<password>", DB_PASSWORD);
DB = DB.replace("<dbname>", DB_NAME);

// const DB = process.env.DATABASE;

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("DB connection successful");
  })
  .catch((err) => {
    console.log(err);
  });

const port = process.env.PORT || 8000;
httpServer.listen(port);
httpServer.keepAliveTimeout = 61 * 1000;
httpServer.headersTimeout = 65 * 1000;
// const server = app.listen(port, () => {
//   console.log(`App running on port ${port}`);
// });

// handle all promise rejection
process.on("unhandledRejection", (err) => {
  console.log("UNHANDLED REJECTION! SHUTTING DOWN...");
  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});
