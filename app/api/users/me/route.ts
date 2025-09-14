import { authOptions } from "@/lib/auth";
import prisma from "@/lib/db";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

export async function PUT(req: NextRequest) {
  const { user } = await req.json();
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    const userId = session.user.id;
    await prisma.user.update({
      where: {
        id: userId,
      },
      data: user,
    });
    return NextResponse.json({ status: 200, message: "Name updated" });
  } catch (error) {
    console.log(error);
    return NextResponse.json({ status: 500, messsage: "Request failed" });
  }
}
