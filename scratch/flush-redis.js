import Redis from 'ioredis';
const redis = new Redis();
redis.flushall().then(() => {
  console.log("Redis cache successfully flushed.");
  process.exit(0);
}).catch(err => {
  console.error("Error flushing redis:", err);
  process.exit(1);
});
