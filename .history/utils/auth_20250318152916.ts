import * as dotenv from 'dotenv';
import { MongoClient } from 'mongodb';
import { betterAuth } from 'better-auth';
import { mongodbAdapter } from 'better-auth/adapters/mongodb';

dotenv.config();

async function connect() {
  try {
    // Connect to MongoDB Atlas
    const client = new MongoClient(process.env.MONGODB_URI!);
    await client.connect(); // Wait for connection to succeed
    console.log('Successfully connected to MongoDB Atlas');
    const db = client.db();

    // Initialize Better Auth
    const auth = betterAuth({
      database: mongodbAdapter(db),
    });

    return auth;
  } catch (err) {
    console.error('Error connecting to MongoDB Atlas:', err);
  }
}

connect(); 
