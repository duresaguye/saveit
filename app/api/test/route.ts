import { NextResponse } from "next/server";  
import clientPromise from "@/utils/mongodb";  

export async function GET() {
    try {
        const client = await clientPromise;
        const db = client.db("saveit");
        
        return NextResponse.json({
            message: "✅ MongoDB Connected!",
            dbName: db.databaseName,
        });
    } catch (error) {
        return NextResponse.json(
            { error: "❌ Database connection failed" },
            { status: 500 }
        );
    }
}
