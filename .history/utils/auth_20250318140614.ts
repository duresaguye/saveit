import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import client from "@/utils/mongodb"; // Use default import here

export const auth = betterAuth({
    database: mongodbAdapter(client)
});
