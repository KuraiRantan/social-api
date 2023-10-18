const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const http = require("http");
const { configureSocket } = require("../socket/index");
const db = require("../db/models");
const userRouter = require("../routes/user");
const authRouter = require("../routes/auth");
const postRouter = require("../routes/post");
const friendRouter = require("../routes/friend");
const notificationRouter = require("../routes/notification");
const messageRouter = require("../routes/message");
const commentRouter = require("../routes/comment");
const authentication = require("../middlewares/authentication");

class Server {
  constructor() {
    this.port = process.env.PORT || 3000;
    this.app = express();
    this.server = http.createServer(this.app);
    const { io, connectedUsers } = configureSocket(this.server);
    this.io = io;
    this.connectedUsers = connectedUsers;

    // middlewares
    this.middlewares();
    this.routes();
  }

  routes() {
    this.app.use("/", authRouter);
    this.app.use("/", userRouter);
    this.app.use("/", [authentication], postRouter);
    this.app.use("/", [authentication], friendRouter);
    this.app.use("/", [authentication], notificationRouter);
    this.app.use("/", [authentication], messageRouter);
    this.app.use("/", [authentication], commentRouter);
  }

  middlewares() {
    // this.app.use(cors({
    //     origin: 'http://localhost:8080'
    // }));
    this.app.use(express.json());
    this.app.use(cors());
    this.app.use((req, res, next) => {
      //Middleware para exponer io a toda la app.
      req.io = this.io;
      req.connectedUsers = this.connectedUsers;
      next();
    });
    this.app.use(morgan("combined"));
    this.app.use(express.static("public"));
  }

  async run() {
    try {
      await db.sequelize.sync({ alert: false, logging: false });
      console.log("Base de datos conectada.");
      this.server.listen(this.port, () =>
        console.log(`Listen on port ${this.port}`)
      );
    } catch (error) {
      console.log(error);
    }
  }
}

module.exports = {
  Server,
};
