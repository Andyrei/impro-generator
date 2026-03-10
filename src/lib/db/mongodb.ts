import mongoose from "mongoose";
import * as dotenv from "dotenv";

dotenv.config();

const MONGO_URI = process.env.MONGO_URI as string;
const CONNECT_TIMEOUT_MS = 15000;

if (!MONGO_URI) throw new Error("MONGO_URI is missing in .env");

type MongooseCache = {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
};

const globalWithMongoose = global as typeof globalThis & {
  mongoose?: MongooseCache;
};

const cached: MongooseCache =
  globalWithMongoose.mongoose ??
  (globalWithMongoose.mongoose = { conn: null, promise: null });

function withTimeout<T>(promise: Promise<T>, timeoutMs: number, message: string): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(message)), timeoutMs);

    promise
      .then((value) => {
        clearTimeout(timer);
        resolve(value);
      })
      .catch((error) => {
        clearTimeout(timer);
        reject(error);
      });
  });
}


export async function connectDB(): Promise<typeof mongoose> {
  // Fast path: existing connection is healthy
  if (cached.conn && mongoose.connection.readyState === 1) return cached.conn;

  // Stale path: conn object exists but socket is gone (dropped by Atlas / idle timeout)
  if (mongoose.connection.readyState !== 1 && mongoose.connection.readyState !== 2) {
    cached.conn = null;
    cached.promise = null;
  }

  if (!cached.promise) {
    // If Mongoose is already reconnecting, wait for that attempt instead of reusing a stale resolved promise.
    if (mongoose.connection.readyState === 2) {
      cached.promise = withTimeout(
        mongoose.connection.asPromise().then(() => mongoose),
        CONNECT_TIMEOUT_MS,
        "Mongoose reconnection timed out"
      );
    } else {
      cached.promise = mongoose
        .connect(MONGO_URI, { serverSelectionTimeoutMS: CONNECT_TIMEOUT_MS })
        .then((m) => m);
    }
  }

  try {
    cached.conn = await cached.promise;
    return cached.conn;
  } catch (err) {
    cached.conn = null;
    throw err;
  } finally {
    // Cache only in-flight operations; once settled, force a fresh promise if reconnect starts later.
    cached.promise = null;
  }
}

