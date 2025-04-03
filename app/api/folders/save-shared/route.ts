import { NextResponse, NextRequest } from "next/server"
import { PrismaClient } from "@prisma/client"
import { auth } from "@/utils/auth"
import { headers } from 'next/headers'


const prisma = new PrismaClient()

export async function POST(req: NextRequest) {
 const session = await auth.api.getSession({
       headers: headers(),
     })
 
     if (!session?.user?.id) {
       return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
     }
 
  try {
    const { folderIds } = await req.json()
    
    // Get original folders with links
    const originalFolders = await prisma.folder.findMany({
      where: { id: { in: folderIds } },
      include: { links: true }
    })

    // Create new folders with links for current user
    let savedLinks = 0
    const newFolders = await Promise.all(
      originalFolders.map(async (folder) => {
        const newFolder = await prisma.folder.create({
          data: {
            name: folder.name,
            userId: session.user.id,
            links: {
              connect: folder.links.map(link => ({ id: link.id }))
            }
          }
        })
        savedLinks += folder.links.length
        return newFolder
      })
    )

    return NextResponse.json({
      savedFolders: newFolders.length,
      savedLinks: savedLinks
    })

  } catch (error) {
    console.error("[SAVE_SHARED_FOLDERS]", error)
    return NextResponse.json(
      { message: 'Error saving folders' }, 
      { status: 500 }
    )
  }
}