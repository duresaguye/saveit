import type { NextApiRequest, NextApiResponse } from "next";
import clientPromise from "@/utils/mongodb";  

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    try {
        const client = await clientPromise;
        const db = client.db("saveit");

        res.status(200).json({ message: "✅ MongoDB Connected!", dbName: db.databaseName });
    } catch (error) {
        res.status(500).json({ error: "❌ Database connection failed" });
    }
}
