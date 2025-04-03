import { NextResponse, NextRequest } from "next/server"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const ids = searchParams.get('ids')?.split(',').map(Number) || []

    const folders = await prisma.folder.findMany({
      where: { id: { in: ids } },
      include: { links: true }
    })

    if (!folders.length) {
      return NextResponse.json({ error: "Folders not found" }, { status: 404 })
    }

    return NextResponse.json(folders)
  } catch (error) {
    console.error("[SHARED_FOLDERS_GET]", error)
    return NextResponse.json(
      { message: 'Error fetching shared folders' }, 
      { status: 500 }
    )
  }
}