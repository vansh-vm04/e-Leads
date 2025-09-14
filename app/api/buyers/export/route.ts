import prisma from "@/lib/db";
import { NextResponse } from "next/server";
import { Parser } from "json2csv";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { SourceExportMap, TimeLineExportMap } from "@/lib/map";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    const { filters, orderBy } = await req.json();

    const buyers = await prisma.buyer.findMany({
      where: filters || {},
      orderBy: orderBy || { createdAt: "desc" },
      select: {
        fullName: true,
        email: true,
        phone: true,
        city: true,
        propertyType: true,
        bhk: true,
        purpose: true,
        budgetMin: true,
        budgetMax: true,
        timeline: true,
        source: true,
        status: true,
        notes: true,
        tags: true,
      },
    });

    const buyersExport = buyers.map((buyer) => ({
      fullName: buyer.fullName,
      email: buyer.email || "",
      phone: `'${buyer.phone}'`,
      city: buyer.city,
      propertyType: buyer.propertyType,
      bhk: buyer.bhk || "",
      purpose: buyer.purpose,
      budgetMin: buyer.budgetMin ?? "",
      budgetMax: buyer.budgetMax ?? "",
      timeline: TimeLineExportMap[buyer.timeline],
      source: SourceExportMap[buyer.source],
      status: buyer.status,
      notes: buyer.notes || "",
      tags: buyer.tags?.join(",") || "",
    }));

    const parser = new Parser();
    const csv = parser.parse(buyersExport);

    return new NextResponse(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": 'attachment; filename="buyers.csv"',
      },
    });
  } catch (error) {
    console.log(error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
