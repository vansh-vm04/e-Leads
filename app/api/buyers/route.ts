import { authOptions } from "@/lib/auth";
import prisma from "@/lib/db";
import { TimeLineMap } from "@/lib/map";
import { checkRateLimit } from "@/lib/rateLimiter";
import { type BuyerType, BuyerSchema } from "@/lib/zod/schema";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    const { searchParams } = new URL(req.url);

    const page = parseInt(searchParams.get("page") || "1", 10);
    const pageSize = parseInt(searchParams.get("pageSize") || "10", 10);

    const city = searchParams.get("city") || undefined;
    const propertyType = searchParams.get("propertyType") || undefined;
    const status = searchParams.get("status") || undefined;
    const timeline = searchParams.get("timeline") || undefined;
    const search = searchParams.get("search") || undefined;
    const sort = searchParams.get("sort") || "desc";

    const where: { [key: string]: unknown } = {};

    if (city) where.city = city;
    if (propertyType) where.propertyType = propertyType;
    if (status) where.status = status;
    if (timeline) where.timeline = timeline;
    if (search) {
      where.OR = [
        { fullName: { contains: search, mode: "insensitive" } },
        { phone: { contains: search } },
        { email: { contains: search, mode: "insensitive" } },
      ];
    }

    const [buyers, total] = await Promise.all([
      prisma.buyer.findMany({
        where,
        include: {
          owner: { select: { name: true } },
        },
        orderBy: { updatedAt: sort === "asc" ? "asc" : "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.buyer.count({ where }),
    ]);

    return NextResponse.json(
      {
        data: buyers,
        total,
        page,
        pageSize,
      },
      { status: 200 }
    );
  } catch (err) {
    console.error(err);
    return NextResponse.json({ status: 500, error: "Server error" });
  }
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for") ?? "unknown";

  if (!checkRateLimit(ip)) {
    return NextResponse.json(
      { message: "Too many requests, please wait." },
      { status: 429 }
    );
  }
  
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    const userId = session.user.id;
    const { data } = await req.json();

    data["ownerId"] = userId;
    const validData: { [key: string]: unknown } = {};
    for (const key in data) {
      if (data[key] != null && data[key] != "") {
        validData[key] = data[key];
      }
    }
    console.log(validData);
    const parsed = BuyerSchema.safeParse(validData);

    if (!parsed.success) {
      console.log(parsed.error.issues);
      return NextResponse.json(
        { status: 400, message: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const buyerData: BuyerType = parsed.data;

    if (buyerData.budgetMin && buyerData.budgetMax) {
      if (buyerData.budgetMax <= buyerData.budgetMin) {
        return NextResponse.json(
          {
            status: 400,
            message: "Max budget should be greater than min budget",
          },
          { status: 400 }
        );
      }
    }

    if (
      (buyerData?.propertyType === "Apartment" ||
        buyerData?.propertyType === "Villa") &&
      !buyerData?.bhk
    ) {
      return NextResponse.json(
        {
          status: 400,
          message: "BHK is required for Apartment or villa",
        },
        { status: 400 }
      );
    }

    const buyer = await prisma.buyer.create({
      data: {
        ...(buyerData as BuyerType),
      },
    });

    await prisma.buyerHistory.create({
      data: {
        buyerId: buyer.id,
        changedBy: userId,
        diff: { created: buyer },
      },
    });

    return NextResponse.json({ status: 200 }, { status: 200 });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { status: 500, error: "Server error" },
      { status: 500 }
    );
  }
}
