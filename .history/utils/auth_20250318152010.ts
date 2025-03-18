import { betterAuth } from "better-auth";
import { MongoClient } from "mongodb";
import { mongodbAdapter } from "better-auth/adapters/mongodb";

const mongoUri = process.env.MONGODB_URI;

if (!mongoUri) {
  throw new Error(
    "Please define the MONGODB_URI environment variable inside .env.local"
  );
}

const client = new MongoClient(mongoUri);
const db = client.db();

export const auth = betterAuth({
  database: mongodbAdapter(db),
});

// Prevent multiple connections
// @ts-expect-error
if (process.env.NODE_ENV !== "production") globalThis.mongo = client.connect();