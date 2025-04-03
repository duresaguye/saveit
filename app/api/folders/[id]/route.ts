import { NextResponse, NextRequest } from "next/server"
import { PrismaClient } from "@prisma/client"
import { auth } from "@/utils/auth"
import { headers } from 'next/headers'

const prisma = new PrismaClient()

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await auth.api.getSession({
      headers: headers(),
    })

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const folder = await prisma.folder.findUnique({
      where: {
        id: Number(params.id),
        userId: session.user.id
      },
      include: {
        links: true
      }
    })

    if (!folder) {
      return NextResponse.json({ error: "Folder not found" }, { status: 404 })
    }

    return NextResponse.json(folder)
  } catch (error) {
    console.error("[FOLDER_GET]", error)
    return NextResponse.json(
      { message: 'Error fetching folder' }, 
      { status: 500 }
    )
  }
  
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { name, linkIds } = await req.json()
    const session = await auth.api.getSession({ headers: headers() })

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }


    const existingFolder = await prisma.folder.findUnique({
      where: { 
        id: Number(params.id),
        userId: session.user.id 
      }
    })

    if (!existingFolder) {
      return NextResponse.json({ error: "Folder not found" }, { status: 404 })
    }

    const folder = await prisma.folder.update({
      where: { 
        id: Number(params.id), 
        userId: session.user.id 
      },
      data: {
        name,
        links: {
          set: linkIds?.map((id: number) => ({ id })) || []
        }
      },
      include: { links: true }
    })

    return NextResponse.json(folder)
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { message: 'Error updating folder' }, 
      { status: 500 }
    )
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await auth.api.getSession({ headers: headers() })

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await prisma.folder.delete({
      where: { 
        id: Number(params.id), 
        userId: session.user.id 
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { message: 'Error deleting folder' }, 
      { status: 500 }
    )
  }
}