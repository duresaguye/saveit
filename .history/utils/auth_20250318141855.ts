import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import clientPromise from "@/utils/mongodb";

const initAuth = async () => {
  const client = await clientPromise; 
  const db = client.db(); 
  return betterAuth({
    database: mongodbAdapter(db), 
  });
};

initAuth().then(auth => {
  console.log("Auth initialized");
}).catch((err) => {
  console.error("Error initializing auth", err);
});
