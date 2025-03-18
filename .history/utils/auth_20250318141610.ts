import { betterAuth } from "better-auth";
import { MongoClient } from "mongodb";
import { mongodbAdapter } from "better-auth/adapters/mongodb";

// Access the MongoDB URI from the environment variable
const uri = process.env.MONGODB_URI as string;

const client = new MongoClient(uri);

// Function to get the Db instance once connected
const connectToDatabase = async () => {
  await client.connect(); // Ensure the client connects
  const db = client.db(); // Get the database once connected
  return db;
};

const initAuth = async () => {
  const db = await connectToDatabase(); // Get the db instance
  // Now pass the Db to betterAuth
  return betterAuth({
    database: mongodbAdapter(db), // Pass Db instance to adapter
  });
};

// Call the initAuth function and get the auth instance
initAuth().then(auth => {
  // You can now use the auth instance
  console.log("Auth initialized");
}).catch((err) => {
  console.error("Error initializing auth", err);
});
