import 'dotenv/config';
import { z } from 'zod';

const EnvSceama = z.object({
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
    PORT: z.coerce.number().int().positive().default(8081),
    LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace']).default('info'),

    DATABASE_URL: z.string().url(),
    REDIS_URL: z.string().url(),

    JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters long'),
    JWT_EXPIRY: z.string().default('7d'),


    CORS_ORIGIN: z.string().default('*'),

    ML_API_URL: z.string().url(),
    ML_API_TIMEOUT_MS: z.coerce.number().int().positive().default(2500),
    IMD_API_KEY: z.string().default('5b94d5e39dc7f1cdfbc1e079a53566814c47727a4baea7f7e0e6a93eb1fd8ae5'),
})

const parsed = EnvSceama.safeParse(process.env);
if (!parsed.success) {
    console.error('❌ Invalid environment variables:');
    console.error(z.treeifyError(parsed.error));
    process.exit(1);
}

export const env = Object.freeze(parsed.data);
export type Env = z.infer<typeof EnvSceama>;



