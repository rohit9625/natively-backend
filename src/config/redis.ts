import "dotenv/config";
import {Redis} from "ioredis";

const redisURL = process.env.REDIS_URL;
if (!redisURL) {
  throw new Error("REDIS_URL is missing");
}

const connection = new Redis(redisURL, {
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
  tls: {},
});

export default connection;