import { betterAuth } from "better-auth";
import { MongoClient } from "mongodb";
import { mongodbAdapter } from "better-auth/adapters/mongodb";

// The MongoDB URI is fetched from environment variables
const client = new MongoClient(process.env.MONGODB_URI!);

// This function connects to MongoDB and returns the adapter
const getDb = async () => {
  // Ensure the connection to MongoDB is established before getting the DB
  if (!client.isConnected()) {
    await client.connect();
  }
  return client.db();
};

// Set up the authentication with the MongoDB adapter
const auth = async () => {
  const db = await getDb();  // Get the connected database instance
  return betterAuth({
    database: mongodbAdapter(db),
  });
};

export default auth;
