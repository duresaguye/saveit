
import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import clientPromise from "@/utils/mongodb";

const initAuth = async () => {
  const client = await clientPromise; // Wait for the MongoDB client connection
  const db = client.db(); // Get the database instance
  return betterAuth({
    database: mongodbAdapter(db), // Pass the db to betterAuth
  });
};

initAuth()
  .then((auth) => {
    console.log("Auth initialized");
  })
  .catch((err) => {
    console.error("Error initializing auth", err);
  });
