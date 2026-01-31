import { pinoHttp } from "pino-http";
import { env } from "../config/env.js";

export const requestLogger = pinoHttp({
  level: env.logLevel
});
