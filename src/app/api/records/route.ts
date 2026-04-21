import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const records = await prisma.dayRecord.findMany({
      where: {
        userId,
      },
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
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { date, completed, completedAt } = body;

    if (!date) {
      return NextResponse.json({ error: "Date is required" }, { status: 400 });
    }

    const record = await prisma.dayRecord.upsert({
      where: {
        userId_date: {
          userId,
          date,
        },
      },
      update: {
        completed,
        completedAt: completedAt ? new Date(completedAt) : null,
      },
      create: {
        userId,
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
