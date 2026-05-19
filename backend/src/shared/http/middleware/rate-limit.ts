import { rateLimit, type Options } from 'express-rate-limit';
import { RedisStore, type RedisReply } from 'rate-limit-redis';
import { redis } from '../../cache/redis.js';

const baseStore = (): Options['store'] =>
  new RedisStore({
    // ioredis adapter — variadic `call` signature matches what RedisStore expects
    sendCommand: (...args: string[]) => redis.call(...(args as [string, ...string[]])) as Promise<RedisReply>,
    prefix: 'rl:',
  });

const make = (windowMs: number, max: number) =>
  rateLimit({
    windowMs,
    max,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    store: baseStore(),
    message: { ok: false, code: 'RATE_LIMITED', message: 'Too many requests' },
  });

import { env } from '../../config/env.js';

const isDev = env.NODE_ENV === 'development' || env.NODE_ENV === 'test';

export const authLimiter     = make(60_000, isDev ? 1000 : 5);    // 5 / min
export const sosLimiter      = make(60_000, isDev ? 1000 : 3);    // 3 / min
export const locationLimiter = make(60_000, isDev ? 10000 : 60);   // 60 / min
export const generalLimiter  = make(60_000, isDev ? 10000 : 100);  // 100 / min