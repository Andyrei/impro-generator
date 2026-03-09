import mongoose from "mongoose";
import * as dotenv from "dotenv";

dotenv.config();

const MONGO_URI = process.env.MONGO_URI as string;

if (!MONGO_URI) throw new Error("MONGO_URI is missing in .env");

let cached = (global as any).mongoose;

if (!cached) {
  cached = (global as any).mongoose = { conn: null, promise: null };
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
    cached.promise = mongoose.connect(MONGO_URI).then((m) => m).catch((err) => {
      cached.conn = null;
      cached.promise = null;
      throw err;
    });
  }
  cached.conn = await cached.promise;
  return cached.conn;
}

