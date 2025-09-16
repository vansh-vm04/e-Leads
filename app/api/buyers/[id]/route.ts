import { Prisma } from "@/app/generated/prisma";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/db";
import { BuyerSchema, BuyerType } from "@/lib/zod/schema";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  const { data, updatedAt } = await req.json();
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
  const userId = session.user.id;
  try {
    data["ownerId"] = userId;
    const validData:{[key:string]:unknown} = {};
    for(const key in data){
      if(data[key] != null && data[key] != ''){
        validData[key] = data[key];
      }
    }
    console.log(validData)
    console.log(updatedAt)
    const parsed = BuyerSchema.safeParse(validData);
    if (!parsed.success) {
      console.log(parsed.error.issues)
      return NextResponse.json(
        { message: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const buyerData: BuyerType = parsed.data;

    const currentUserTime = new Date(updatedAt);

    const existing = await prisma.buyer.findUnique({
      where: { id },
    });
    if (!existing) {
      return NextResponse.json({message: "Buyer not found" }, {status: 404} );
    }

    if (existing.ownerId !== userId) {
      return NextResponse.json({ message: "Forbidden" },{status: 403});
    }

    const previousTime = new Date(existing.updatedAt);

    if (previousTime.toISOString() !== currentUserTime.toISOString()) {
      return NextResponse.json(
        { status: 409, error: "Record changed, please refresh" },
        { status: 409 }
      );
    }

    const updated = await prisma.buyer.update({
      where: { id },
      data: { ...buyerData },
    });

    const diff: Record<string, { old: unknown; new: unknown }> = {};
    for (const key in buyerData) {
      if (
        (existing as Prisma.BuyerGetPayload<object>)[key as keyof BuyerType] !==
        (buyerData as BuyerType)[key as keyof BuyerType]
      ) {
        diff[key as keyof BuyerType] = {
          old: (existing as Prisma.BuyerGetPayload<object>)[
            key as keyof BuyerType
          ],
          new: (buyerData as BuyerType)[key as keyof BuyerType],
        };
      }
    }

    await prisma.buyerHistory.create({
      data: {
        buyerId: id,
        changedBy: userId,
        diff: diff as Prisma.InputJsonValue,
      },
    });

    return NextResponse.json({ buyer: updated },{status: 200});
  } catch (error) {
    console.log(error);
    return NextResponse.json({ message: "Server error" },{status: 500});
  }
}

export async function DELETE(
    req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
  const userId = session.user.id;
  try {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return NextResponse.json({ message: "User not found" },{status: 404});
    }

    const buyer = await prisma.buyer.findUnique({ where: { id } });

    if (user?.id !== buyer?.ownerId) {
      return NextResponse.json(
        { message: "Anauthorized User" },
        { status: 401 }
      );
    }
    await prisma.buyerHistory.deleteMany({where:{buyerId: id}});
    await prisma.buyer.delete({ where: { id } });
    return NextResponse.json({ message: "Buyer deleted" }, { status: 200 });
  } catch (error) {
    console.log(error);
    return NextResponse.json({ message: "Unable to delete" }, { status: 500 });
  }
}

export async function GET(req:NextRequest, {params}:{params:{id:string}}){
  const id = await params.id;
  try {
    const data = await prisma.buyer.findUnique({where:{id}});
    return NextResponse.json({data},{status:200})
  } catch (error) {
    console.log(error)
    return NextResponse.json({status:500})
  }
}