import prisma from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  try {
    if (!id)
      return NextResponse.json({ status: 400, message: "Invalid buyer id" });
    const history = await prisma.buyerHistory.findMany({
      where: {
        buyerId: id,
      },
      orderBy: {
        changedAt: "desc",
      },
      take: 5,
      include: {
        user: {
          select: {
            name: true,
          },
        },
      },
    });
    return NextResponse.json({ status: 200, history });
  } catch (error) {
    console.log(error);
    return NextResponse.json({ status: 500 });
  }
}
