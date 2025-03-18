import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { client } from "@/utils/mongodb"; 
 
export const auth = betterAuth({
    database: mongodbAdapter(client)
});