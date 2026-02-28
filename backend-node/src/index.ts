import http from "http";
import express from "express";
import cors from "cors";
import { WebSocketServer } from "ws";
import { env } from "./config/env.js";
import { corsOptions } from "./config/cors.js";
import routes from "./routes/index.js";
import { requestLogger } from "./middleware/requestLogger.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { registerWebSocketServer } from "./services/websocketHub.js";
import { connectDatabase } from "./config/database.js";
import { seedDatabase } from "./services/mongoStore.js";
import { startCronJobs } from "./services/cronJobs.js";

const app = express();

app.use(requestLogger);
app.use(cors(corsOptions));
app.use(express.json());
app.use(routes);
app.use(errorHandler);

const server = http.createServer(app);
const wss = new WebSocketServer({ server, path: "/ws-connect" });
registerWebSocketServer(wss);

// Connect to MongoDB and start server
async function start() {
  try {
    const connected = await connectDatabase();
    
    if (connected) {
      await seedDatabase();
      startCronJobs();
    }
    
    server.listen(env.port, "0.0.0.0", () => {
      // eslint-disable-next-line no-console
      console.log(`🚀 backend-node listening on http://localhost:${env.port}`);
    });

    // Keep process alive
    process.on("SIGINT", () => {
      console.log("\n👋 Shutting down...");
      server.close();
      process.exit(0);
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
}

start().catch(console.error);
