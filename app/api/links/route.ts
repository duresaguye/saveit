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

    const { searchParams } = new URL(req.url)
    const folderId = searchParams.get('folderId')

    const links = await prisma.link.findMany({
      where: {
        userId: session.user.id,
        ...(folderId ? { folders: { some: { id: Number(folderId) } } } : {})
      },
      include: {
        folders: true
      }
    })

    return NextResponse.json(links)
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { message: 'Error fetching links' }, 
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
    try {
      const { title, url, tags, category, folderId, description } = await req.json();
      const session = await auth.api.getSession({ headers: headers() });
  
      if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
  
      // Create the link with proper tag relationships
      const link = await prisma.link.create({
        data: {
          title,
          url,
          description,
          category,
          userId: session.user.id,
          // Handle tags through the relation table
          tags: {
            connectOrCreate: tags.map((tagName: string) => ({
              where: { name: tagName },
              create: { name: tagName }
            }))
          },
          // Handle folder relationship
          ...(folderId && {
            folders: {
              connect: { id: Number(folderId) }
            }
          })
        },
        include: {
          tags: true,
          folders: true
        }
      });
  
      return NextResponse.json(link);
    } catch (error) {
      console.error(error);
      return NextResponse.json(
        { message: 'Error creating link' }, 
        { status: 500 }
      );
    }
  }

export async function PUT(req: NextRequest) {
  try {
    const { id, ...updateData } = await req.json()
    const session = await auth.api.getSession({ headers: headers() })

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const updatedLink = await prisma.link.update({
      where: { id: Number(id), userId: session.user.id },
      data: updateData,
      include: { folders: true }
    })

    return NextResponse.json(updatedLink)
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { message: 'Error updating link' }, 
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

    await prisma.link.delete({
      where: { id: Number(id), userId: session.user.id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { message: 'Error deleting link' }, 
      { status: 500 }
    )
  }
}