import { NextResponse, NextRequest } from "next/server"
import { PrismaClient } from "@prisma/client"
import { auth } from "@/utils/auth"
import { headers } from 'next/headers'

const prisma = new PrismaClient()

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await auth.api.getSession({
      headers: headers(),
    })

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await prisma.link.delete({
      where: {
        id: Number(params.id),
        userId: session.user.id
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[LINK_DELETE]", error)
    return NextResponse.json(
      { message: 'Error deleting link' }, 
      { status: 500 }
    )
  }
}