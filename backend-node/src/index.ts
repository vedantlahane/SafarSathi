import http from "http";
import express from "express";
import cors from "cors";
import { WebSocketServer } from "ws";
import { env } from "./config/env.js";
import { corsOptions } from "./config/cors.js";
import routes from "./routes/index.js";
import { requestLogger } from "./middleware/requestLogger.js";
import { errorHandler } from "./middleware/errorHandler.js";

const app = express();

app.use(requestLogger);
app.use(cors(corsOptions));
app.use(express.json());
app.use(routes);
app.use(errorHandler);

const server = http.createServer(app);
const wss = new WebSocketServer({ server, path: "/ws" });

wss.on("connection", (socket) => {
  socket.send(JSON.stringify({ message: "Connected to SafarSathi WS" }));
  socket.on("message", (data) => {
    socket.send(JSON.stringify({ echo: data.toString() }));
  });
});

server.listen(env.port, () => {
  // eslint-disable-next-line no-console
  console.log(`backend-node listening on port ${env.port}`);
});
