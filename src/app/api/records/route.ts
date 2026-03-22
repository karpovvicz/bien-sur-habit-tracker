import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const records = await prisma.dayRecord.findMany({
      orderBy: {
        date: "desc",
      },
    });

    // Transform to match the existing format
    const recordsMap = records.reduce(
      (acc, record) => {
        acc[record.date] = {
          date: record.date,
          completed: record.completed,
          completedAt: record.completedAt?.toISOString() || null,
        };
        return acc;
      },
      {} as Record<string, { date: string; completed: boolean; completedAt: string | null }>
    );

    return NextResponse.json({ records: recordsMap });
  } catch (error) {
    console.error("Error fetching records:", error);
    return NextResponse.json({ error: "Failed to fetch records" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { date, completed, completedAt } = body;

    if (!date) {
      return NextResponse.json({ error: "Date is required" }, { status: 400 });
    }

    const record = await prisma.dayRecord.upsert({
      where: { date },
      update: {
        completed,
        completedAt: completedAt ? new Date(completedAt) : null,
      },
      create: {
        date,
        completed,
        completedAt: completedAt ? new Date(completedAt) : null,
      },
    });

    return NextResponse.json({
      record: {
        date: record.date,
        completed: record.completed,
        completedAt: record.completedAt?.toISOString() || null,
      },
    });
  } catch (error) {
    console.error("Error saving record:", error);
    return NextResponse.json({ error: "Failed to save record" }, { status: 500 });
  }
}
