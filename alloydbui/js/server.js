const { ipcRenderer } = require("electron");
const fs = require("fs");
const path = require("path");
const fileUpload = require("express-fileupload");
const express = require("express");
var bodyParser = require("body-parser");
process.env.DEBUG = "*";
var logger = {};
class Server {
  constructor(env) {
    process.env = env;
    logger = require(path.join(process.env.APP_DIR, "common", "logger"));
    logger.info("alloydb", "WEB UI Started");
    this.db = window.require("better-sqlite3")(process.env.DATABASE);
    this.db.pragma("journal_mode = WAL");
    process.on("exit", () => {
      this.db.close();
    });
    process.on("SIGHUP", () => process.exit(128 + 1));
    process.on("SIGINT", () => process.exit(128 + 2));
    process.on("SIGTERM", () => process.exit(128 + 15));
    this.create();
    this.startServer();
  }

  create() {
    this.notify(null, null);
    this.app = express();
    this.server = require("http").Server(this.app);
    this.app.use(express.json());
    this.app.use(express.urlencoded());
    this.app.use(fileUpload({
      limits: { fileSize: 1024 * 1024 * 1024 }
    }));
    this.app.use((req, res, next) => {
      res.header("Access-Control-Allow-Origin", "*");
      res.header(
        "Access-Control-Allow-Headers",
        "Origin, X-Requested-With, Content-Type, Accept"
      );
      res.header(
        "Access-Control-Allow-Methods",
        "PUT, POST, GET, DELETE, OPTIONS"
      );

      if (req.method === "OPTIONS") {
        res.send(200);
      } else {
        next();
      }
    });

    this.app.use((req, res, next) => {
      res.locals.ipc = ipcRenderer;
      res.locals.db = this.db;
      next();
    });

    // view engine setup
    this.app.set("views", path.join(__dirname, "views"));
    this.app.set("view engine", "pug");
    this.app.use(bodyParser.json());
    this.app.use(bodyParser.urlencoded({ extended: false }));
    this.app.use(express.static(path.join(__dirname, "public")));
    var coverDir = process.env.COVER_ART_DIR;
    if (!fs.existsSync(coverDir)) {
      fs.mkdirSync(coverDir);
    }

    this.app.use("/api/v1", (req, res, next) => {
      if (req.query.api_key !== process.env.API_KEY) { return res.sendStatus(401); }
      next();
    });

    var expressSwagger = require("express-swagger-generator")(this.app);

    var options = {
      swaggerDefinition: {
        info: {
          description: "This is a sample server",
          title: "Swagger",
          version: "1.0.0"
        },
        host: "localhost:" + process.env.API_PORT,
        basePath: "/api/v1",
        produces: ["application/json"],
        schemes: ["http",
          "https"],
        securityDefinitions: {
          ApiKeyAuth: {
            type: "apiKey",
            in: "query",
            name: "api_key"
          }
        }
      },
      basedir: path.join(process.env.APP_DIR, "alloydbapi"), //app absolute path
      files: ["./v1/**/*.js"] //Path to the API handle folder
    };

    expressSwagger(options);


    var setupRoute = (route) => {
      var tempRoute = require(route);
      tempRoute.db = this.db;
      return tempRoute;
    };
    // V1 API

    this.app.use("/api/v1/system", setupRoute(path.join(process.env.APP_DIR, "alloydbapi", "v1", "system")));
    this.app.use("/api/v1/media", setupRoute(path.join(process.env.APP_DIR, "alloydbapi", "v1", "media")));
    this.app.use("/api/v1/browse", setupRoute(path.join(process.env.APP_DIR, "alloydbapi", "v1", "browse")));
    this.app.use("/api/v1/search", setupRoute(path.join(process.env.APP_DIR, "alloydbapi", "v1", "search")));
    this.app.use("/api/v1/playlist", setupRoute(path.join(process.env.APP_DIR, "alloydbapi", "v1", "playlist")));
    this.app.use("/api/v1/config", setupRoute(path.join(process.env.APP_DIR, "alloydbapi", "v1", "config")));
    this.app.use("/api/v1/share", setupRoute(path.join(process.env.APP_DIR, "alloydbapi", "v1", "share")));
    this.app.use("/api/v1/annotation", setupRoute(path.join(process.env.APP_DIR, "alloydbapi", "v1", "annotation")));
    this.app.use("/api/v1/lastfm", setupRoute(path.join(process.env.APP_DIR, "alloydbapi", "v1", "lastfm")));

    // catch 404 and forward to error handler
    this.app.use((req, res, next) => {
      var err = new Error("Not Found");
      err.status = 404;
      var error = req.path + " - " + err.status + " - " + err.message;
      logger.error("alloydb", error);
      next(err);
    });

    // error handlers

    // development error handler
    // will print stacktrace
    if (process.env.MODE === "dev") {
      this.app.use((err, req, res, next) => {
        res.status(err.status || 500);
        var error = req.path + " - " + err.status + " - " + err.message;
        logger.error("alloydb", error);
      });
    }

    // production error handler
    // no stacktraces leaked to user
    this.app.use((err, req, res, next) => {
      res.status(err.status || 500);
      var error = req.path + " - " + err.status + " - " + err.message;
      logger.error("alloydb", error);
    });

    this.app.set("port", process.env.API_PORT || 4000);


  }

  notify(title, message) {

  }


  startServer(cb) {
    this.server.listen(this.app.get("port"));
    this.server.on("listening", () => {
      logger.info("alloydb", "AlloyDB Started, AlloyDB is Listening on port " + this.app.get("port"));
      ipcRenderer.send("system-get-stats");

      if (cb) { cb(this.server); }
    });
  }

  stopServer() {
    // if (this.server) this.server.close();
    process.exit(0);
  }

}

ipcRenderer.on("server-start", (args, data) => {
  var s = new Server(data);
});