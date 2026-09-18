import mongoose from "mongoose";

// Reuse the connection across invocations on serverless platforms like
// Vercel, instead of opening a new one on every request/cold start.
let cached = global.__mongooseConn;
if (!cached) {
  cached = global.__mongooseConn = { conn: null, promise: null };
}

export async function connectDB() {
  if (cached.conn) return cached.conn;

  const uri = process.env.MONGO_URI;

  if (!uri) {
    if (process.env.VERCEL) {
      // Never silently fall back to localhost in production - that just
      // hangs every DB query until it times out, which looks like a crash.
      throw new Error(
        "MONGO_URI is not set. Add it in Vercel Project Settings -> " +
          "Environment Variables (Production environment) and redeploy."
      );
    }
    console.warn("MONGO_URI not set, falling back to local MongoDB for development.");
  }

  const finalUri = uri || "mongodb://127.0.0.1:27017/booking-platform";

  if (!cached.promise) {
    cached.promise = mongoose
      .connect(finalUri, {
        // Fail fast instead of hanging until the function times out.
        serverSelectionTimeoutMS: 8000,
      })
      .then((m) => {
        console.log("MongoDB connected");
        return m;
      })
      .catch((err) => {
        cached.promise = null; // allow retry on next request
        throw err;
      });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}
