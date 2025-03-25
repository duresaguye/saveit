import { NextResponse, NextRequest } from "next/server"
import { PrismaClient } from "@prisma/client"
import { auth } from "@/utils/auth"
import { headers } from 'next/headers'

const prisma = new PrismaClient()

export async function GET(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: headers(),
    })

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const folders = await prisma.folder.findMany({
      where: { userId: session.user.id },
      include: { links: true }
    })

    return NextResponse.json(folders)
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { message: 'Error fetching folders' }, 
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const { name, linkIds } = await req.json()
    const session = await auth.api.getSession({ headers: headers() })

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const folder = await prisma.folder.create({
      data: {
        name,
        userId: session.user.id,
        links: {
          connect: linkIds?.map((id: number) => ({ id })) || []
        }
      },
      include: { links: true }
    })

    return NextResponse.json(folder)
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { message: 'Error creating folder' }, 
      { status: 500 }
    )
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { id, name, linkIds } = await req.json()
    const session = await auth.api.getSession({ headers: headers() })

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const folder = await prisma.folder.update({
      where: { id: Number(id), userId: session.user.id },
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

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')
    const session = await auth.api.getSession({ headers: headers() })

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await prisma.folder.delete({
      where: { id: Number(id), userId: session.user.id }
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