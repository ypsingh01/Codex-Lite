import mongoose from "mongoose";

export async function connectDB(uri: string) {
  if (!uri || uri.trim().length === 0) {
    throw new Error("MONGODB_URI is missing");
  }

  mongoose.set("strictQuery", true);

  await mongoose.connect(uri, {
    dbName: process.env.NODE_ENV === "test" ? "codex_test" : "codex",
  });
}

