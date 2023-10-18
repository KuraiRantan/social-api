require("dotenv").config();
const { Server } = require("./src/server/index");

const server = new Server();

server.run();
