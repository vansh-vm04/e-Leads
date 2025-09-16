import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import Papa from "papaparse";
import { BuyerSchema, BuyerType } from "@/lib/zod/schema";
import {
  CityEnum,
  PropertyTypeEnum,
  BHKEnum,
  PurposeEnum,
  TimeLineEnum,
  SourceEnum,
  StatusEnum,
} from "@/lib/zod/enums";
import {
  BHKMap,
  CityMap,
  PropertyTypeMap,
  PurposeMap,
  SourceMap,
  StatusMap,
  TimeLineMap,
} from "@/lib/map";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

interface CSVRow {
  fullName: string;
  email?: string;
  phone: string;
  city: string;
  propertyType: string;
  bhk?: string;
  purpose: string;
  budgetMin?: string;
  budgetMax?: string;
  timeline: string;
  source: string;
  notes?: string;
  tags?: string;
  status: string;
}

function toIntOrNull(val: unknown): number | null {
  if(typeof val == 'number') return val;
  if (val === undefined || val === null) return null;
  const str = String(val).trim().replace(/^"|"$/g, "");
  if (str === "") return null;
  const num = Number(str);
  return Number.isFinite(num) ? Math.floor(num) : null;
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    const formData = await req.formData();
    const file = formData.get("file") as File;
    if (!file) {
      return NextResponse.json({ message: "No file uploaded" }, { status: 400 });
    }
    const text = (await file.text()).replace(/'/g, "");
    const parsed = Papa.parse(text, { header: true, dynamicTyping:true, skipEmptyLines: true });
    if (parsed.errors.length > 0) {
      return NextResponse.json({ message: parsed.errors }, { status: 400 });
    }
    const rows = parsed.data as CSVRow[];
    if (rows.length > 200) {
      return NextResponse.json(
        { message: "Max 200 rows allowed" },
        { status: 400 }
      );
    }

    const errors: { row: number; message: string }[] = [];
    const validRows: BuyerType[] = [];

    rows.forEach((row: CSVRow, idx: number) => {
      row.city = CityMap[row.city] || row.city;
      row.propertyType = PropertyTypeMap[row.propertyType] || row.propertyType;
      row.bhk = row.bhk ? BHKMap[row.bhk] : undefined;
      row.purpose = PurposeMap[row.purpose] || row.purpose;
      row.timeline = TimeLineMap[row.timeline];
      row.source = SourceMap[row.source];
      row.status = StatusMap[row.status] || row.status;
      row.phone = String(row.phone) || row.phone;

      const processed: unknown = {
        ...row,
        budgetMin: toIntOrNull(row.budgetMin),
        budgetMax: toIntOrNull(row.budgetMax),
        tags: row.tags ? row.tags.split(",").map((t) => t.trim()) : undefined,
        city: row.city as keyof typeof CityEnum.enum,
        propertyType: row.propertyType as keyof typeof PropertyTypeEnum.enum,
        bhk: row.bhk ? (row.bhk as keyof typeof BHKEnum.enum) : undefined,
        purpose: row.purpose as keyof typeof PurposeEnum.enum,
        timeline: row.timeline as keyof typeof TimeLineEnum.enum,
        source: row.source as keyof typeof SourceEnum.enum,
        status: row.status
          ? (row.status as keyof typeof StatusEnum.enum)
          : undefined,
      };
      const currentUserId = session.user?.id;
      const parsed = BuyerSchema.safeParse({
        ...(processed as CSVRow),
        ownerId: currentUserId,
      });

      if (!parsed.success) {
        errors.push({
          row: idx + 2,
          message: parsed.error.issues.map((e) => e.path).join(", "),
        });
      } else {
        validRows.push(parsed.data);
      }
    });

    if (errors.length > 0){
      console.log(errors)
      return NextResponse.json({ errors }, { status: 400 });
    }
    
    await prisma.buyer.createMany({ data: validRows, skipDuplicates: true });
    return NextResponse.json(
      { success: true, inserted: validRows.length },
      { status: 200 }
    );
  } catch (error) {
    console.log(error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
