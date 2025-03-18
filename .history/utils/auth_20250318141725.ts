import { betterAuth } from "better-auth";
import { MongoClient } from "mongodb";
import { mongodbAdapter } from "better-auth/adapters/mongodb";

const uri = process.env.MONGODB_URI as string;

const client = new MongoClient(uri);


const connectToDatabase = async () => {
  await client.connect(); 
  const db = client.db(); 
  return db;
};

const initAuth = async () => {
  const db = await connectToDatabase(); 
 
  return betterAuth({
    database: mongodbAdapter(db), 
  });
};


initAuth().then(auth => {

  console.log("Auth initialized");
}).catch((err) => {
  console.error("Error initializing auth", err);
});
